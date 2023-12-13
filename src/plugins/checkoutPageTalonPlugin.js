import React, {useCallback, useEffect, useState} from 'react';
import {AlertCircle as AlertCircleIcon} from 'react-feather';

import {useCartContext} from '@magento/peregrine/lib/context/cart';
import PAYTRAIL_OPERATIONS from '../talons/checkoutPageOrderPlace.gql.js';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/CheckoutPage/checkoutPage.gql.js';
import {useToasts} from '@magento/peregrine';

import {
    useApolloClient,
    useMutation
} from '@apollo/client';

import {clearCartDataFromCache} from "@magento/peregrine/lib/Apollo/clearCartDataFromCache";
import {CHECKOUT_STEP} from "@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import Icon from "@magento/venia-ui/lib/components/Icon";

const wrapUseCheckoutPage = (original) => {
    return function useCheckoutPage(...args) {
        const operations = mergeOperations(DEFAULT_OPERATIONS, PAYTRAIL_OPERATIONS);
        const result = original(...args);
        const errorIcon = <Icon src={AlertCircleIcon} size={20}/>;

        const {
            isLoading,
            setCheckoutStep,
            resetReviewOrderButtonClicked
        } = result;

        const {
            createCartMutation,
            restoreQuoteMutation,
            placePaytrailOrderMutation
        } = operations;

        const [, {addToast}] = useToasts();

        const [{cartId}, {createCart, removeCart}] = useCartContext();
        const apolloClient = useApolloClient();
        const [fetchCartId] = useMutation(createCartMutation);

        let [
            placeOrder,
            {
                data: placeOrderData,
                error: placeOrderError,
                loading: placeOrderLoading,
                called: placeOrderCalled
            }
        ] = useMutation(placePaytrailOrderMutation);

        const [orderButtonPress, setOrderButtonPress] = useState();

        const [
            restoreQuote,
            {
                data: restoreQuoteData,
                error: restoreQuoteError,
                loading: restoreQuoteLoading,
                called: restoreQuoteCalled
            }
        ] = useMutation(restoreQuoteMutation);

        const handlePlaceOrder = useCallback(async () => {
            setOrderButtonPress(true);

        }, [ setOrderButtonPress]);

        const refreshCart = async () => {
            await removeCart();
            await clearCartDataFromCache(apolloClient);

            await createCart({
                fetchCartId
            });
        }

        useEffect(() => {
            async function placeOrderAndCleanup() {

                try {
                    const processResult = async () => {
                        setOrderButtonPress(false);
                        const result = await placeOrder({
                            variables: {
                                cartId
                            }
                        });
                        if (result) {
                            const orderData = result.data;
                            const orderPaytrailUrlData =
                                (orderData && orderData.placeOrder.order.paytrail_payment_details) || null;

                            if (orderPaytrailUrlData
                                && (orderPaytrailUrlData.payment_url || orderPaytrailUrlData.error)
                            ) {
                                const {
                                    error: paymentErrors,
                                    payment_url: paymentRedirectUrl,
                                    payment_form: paymentForm
                                } = orderPaytrailUrlData;

                                if (paymentForm) {
                                    paymentForm
                                    let formId = 'paytrail-provider-' + paymentForm.name;
                                    const formElement = document.createElement('form');
                                    formElement.method = paymentForm.method;
                                    formElement.action = paymentForm.action;
                                    formElement.id = formId;
                                    formElement.hidden = true;

                                    paymentForm.inputs.forEach((input) => {
                                        const inputElement = document.createElement('input');
                                        inputElement.type = 'text';
                                        inputElement.name = input.name;
                                        inputElement.value = input.value;
                                        formElement.appendChild(inputElement);
                                    });

                                    document.body.appendChild(formElement);
                                    // Get the form element from the DOM


                                    // Check if the form element is found before attempting to submit
                                    if (formElement) {
                                        await refreshCart();

                                        formElement.submit();
                                    } else {
                                        console.error('Form element not found.');
                                    }

                                } else if (!paymentErrors && paymentRedirectUrl !== '') {

                                    await refreshCart();

                                    return window.location = paymentRedirectUrl;

                                } else {
                                    if (paymentErrors) {
                                        const restoredQuoteData = await restoreQuote({
                                            variables: {
                                                cartId
                                            }
                                        });

                                        if (restoredQuoteData) {
                                            addToast({
                                                type: 'error',
                                                icon: errorIcon,
                                                message: paymentErrors,
                                                dismissable: true,
                                                timeout: 7000
                                            });

                                            if (process.env.NODE_ENV !== 'production') {
                                                console.error(paymentErrors);
                                            }
                                            resetReviewOrderButtonClicked();
                                            setCheckoutStep(CHECKOUT_STEP.PAYMENT);
                                        }
                                    }
                                }
                            } else {
                                await removeCart();
                                await clearCartDataFromCache(apolloClient);

                                await createCart({
                                    fetchCartId
                                });
                            }
                        }
                    }

                    await processResult();

                } catch (err) {
                    console.error(
                        'An error occurred during when placing the order',
                        err
                    );
                    resetReviewOrderButtonClicked();
                    setCheckoutStep(CHECKOUT_STEP.PAYMENT);
                }
            }

            if (orderButtonPress) {
                placeOrderAndCleanup();
            }
        }, [
            apolloClient,
            cartId,
            createCart,
            fetchCartId,
            placeOrder,
            placeOrderCalled,
            removeCart,
            orderButtonPress,
            setOrderButtonPress,
            placeOrderData,
            addToast,
            errorIcon,
            resetReviewOrderButtonClicked,
            setCheckoutStep
        ]);

        const orderPaytrailUrlData =
            (placeOrderData && placeOrderData.placeOrder.order.paytrail_payment_url) || null;

        if (orderPaytrailUrlData && (orderPaytrailUrlData.payment_url || orderPaytrailUrlData.error)) {
            return restoreQuoteData && !restoreQuoteLoading ?
                Object.assign({}, result, {isLoading: false, orderNumber: null, handlePlaceOrder: handlePlaceOrder})
                : Object.assign({}, result, {isLoading: true, orderNumber: null, handlePlaceOrder: handlePlaceOrder});
        }

        return {
            ...result,
            handlePlaceOrder,
            isLoading,

            orderNumber:
                (placeOrderData && placeOrderData.placeOrder.order.order_number) ||
                null,
            placeOrderLoading,
            setCheckoutStep,
            resetReviewOrderButtonClicked
        };
    }
}

export default wrapUseCheckoutPage;
