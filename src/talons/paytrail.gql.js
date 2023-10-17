import { gql } from '@apollo/client';

export const GET_PAYTRAIL_CONFIG_DATA = gql`
    query storeConfigData {
        storeConfig {
            store_code
        }
    }
`;

export const SET_PAYMENT_METHOD_ON_CART = gql`
    mutation setPaymentMethodOnCart(
        $cartId: String!
    ) {
        setPaymentMethodOnCart(
            input: {
                cart_id: $cartId,
                payment_method: { code: "paytrail" } }
        ) @connection(key: "setPaymentMethodOnCart") {
            cart {
                id
                selected_payment_method {
                    code
                    title
                }
            }
        }
    }
`;

export default {
    getPaytrailConfigQuery: GET_PAYTRAIL_CONFIG_DATA,
    setPaymentMethodOnCartMutation: SET_PAYMENT_METHOD_ON_CART
};
