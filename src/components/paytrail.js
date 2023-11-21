import React from 'react';
import {mergeClasses} from '@magento/venia-ui/lib/classify';
import {shape, string, bool, func} from 'prop-types';
import BillingAddress from '@magento/venia-ui/lib/components/CheckoutPage/BillingAddress';
import {usePaytrail} from '../talons/usePaytrail';
import defaultClasses from './paytrail.css';
import PaymentOptions from '@paytrail/paytrail-for-adobe-commerce-pwa-studio/src/components/paymentOptions/paymentOptions';

/**
 * The Paytrail component renders all information to handle paytrail payment.
 *
 * @param {String} props.payableTo shop owner name where you need to send.
 * @param {String} props.mailingAddress shop owner post address where you need to send.
 * @param {Boolean} props.shouldSubmit boolean value which represents if a payment nonce request has been submitted
 * @param {Function} props.onPaymentSuccess callback to invoke when the payment nonce has been generated
 * @param {Function} props.onDropinReady callback to invoke when the braintree dropin component is ready
 * @param {Function} props.onPaymentError callback to invoke when component throws an error
 * @param {Function} props.resetShouldSubmit callback to reset the shouldSubmit flag
 */
const Paytrail = props => {
    const classes = mergeClasses(defaultClasses, props.classes);

    const {resetShouldSubmit, onPaymentSuccess, onPaymentError} = props;
    const addressTemplate = str => (
        <span key={str} className={classes.addressLine}>
            {str} <br/>
        </span>
    );

    const {
        onBillingAddressChangedError,
        onBillingAddressChangedSuccess,
        paytrailConfig,
        setProviderId
    } = usePaytrail({
        onPaymentSuccess,
        onPaymentError,
        resetShouldSubmit,
    });


    return (
        <div className={classes.root}>

            <BillingAddress
                shouldSubmit={props.shouldSubmit}
                onBillingAddressChangedError={onBillingAddressChangedError}
                onBillingAddressChangedSuccess={onBillingAddressChangedSuccess}
                resetShouldSubmit={props.resetShouldSubmit}
            />

            <PaymentOptions
                setProviderId={setProviderId}
                paytrailConfig={paytrailConfig}
            />
        </div>
    );
};

Paytrail.propTypes = {
    classes: shape({root: string}),
    shouldSubmit: bool.isRequired,
    resetShouldSubmit: func.isRequired,
    onPaymentSuccess: func,
    onDropinReady: func,
    onPaymentError: func
};

export default Paytrail;
