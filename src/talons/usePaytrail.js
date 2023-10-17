import {useCallback, useEffect, useState} from 'react';
import {useQuery, useMutation} from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import {useCartContext} from '@magento/peregrine/lib/context/cart';

import DEFAULT_OPERATIONS from './paytrail.gql';

/**
 * Talon to handle paytrail payment.
 *
 * @param {Boolean} props.shouldSubmit boolean value which represents if a payment nonce request has been submitted
 * @param {Function} props.onPaymentSuccess callback to invoke when the a payment nonce has been generated
 * @param {Function} props.onPaymentError callback to invoke when component throws an error
 * @param {Function} props.resetShouldSubmit callback to reset the shouldSubmit flag
 * @param {DocumentNode} props.operations.getPaytrailConfigQuery query to fetch config from backend
 * @param {DocumentNode} props.operations.setPaymentMethodOnCartMutation mutation to set paytrail as payment
 *
 * @returns {
 *  payableTo: String,
 *  mailingAddress: String,
 *  onBillingAddressChangedError: Function,
 *  onBillingAddressChangedSuccess: Function
 * }
 */
export const usePaytrail = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);

    const {
        getPaytrailConfigQuery,
        setPaymentMethodOnCartMutation
    } = operations;


    const defaultIssuer = '3151';

    const [{cartId}] = useCartContext();
    const {data} = useQuery(getPaytrailConfigQuery);
    const {currentSelectedPaymentMethod: selectedMethod} = props;

    const [issuer, setIssuer] = useState(defaultIssuer);


    const {resetShouldSubmit, onPaymentSuccess, onPaymentError} = props;

    const [
        updatePaymentMethod,
        {
            error: paymentMethodMutationError,
            called: paymentMethodMutationCalled,
            loading: paymentMethodMutationLoading
        }
    ] = useMutation(setPaymentMethodOnCartMutation);

    /**
     * This function will be called if cant not set address.
     */
    const onBillingAddressChangedError = useCallback(() => {
        resetShouldSubmit();
    }, [resetShouldSubmit]);

    /**
     * This function will be called if address was successfully set.
     */
    const onBillingAddressChangedSuccess = useCallback(() => {
        updatePaymentMethod({
            variables: {cartId, selectedMethod, issuer}
        });
    }, [updatePaymentMethod, cartId, selectedMethod, issuer]);

    const handleIssuerSelection = useCallback(
        value => {
            setIssuer(value);
        },
        [setIssuer]
    );

    useEffect(() => {
        const paymentMethodMutationCompleted =
            paymentMethodMutationCalled && !paymentMethodMutationLoading;

        if (paymentMethodMutationCompleted && !paymentMethodMutationError) {
            onPaymentSuccess();
        }

        if (paymentMethodMutationCompleted && paymentMethodMutationError) {
            onPaymentError();
        }
    }, [
        paymentMethodMutationError,
        paymentMethodMutationLoading,
        paymentMethodMutationCalled,
        onPaymentSuccess,
        onPaymentError,
        resetShouldSubmit
    ]);

    return {
        onBillingAddressChangedSuccess,
        onBillingAddressChangedError,
        handleIssuerSelection
    };
};
