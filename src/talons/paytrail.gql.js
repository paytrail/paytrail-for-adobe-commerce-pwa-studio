import { gql } from '@apollo/client';

export const GET_PAYTRAIL_CONFIG_DATA = gql`
    query getPaytrailConfig(
        $cartId: String!
    ) {
        paytrailConfigData(cart_id: $cartId) {
            groups {
                id
                name
                icon
                providers {
                    checkoutId
                    id
                    name
                    group
                    icon
                    svg
                }
            }
        }
    }
`;


export const SET_PAYMENT_METHOD_ON_CART = gql`
    mutation setPaymentMethodOnCart(
        $cartId: String!,
        $providerId: String!
    ) {
        setPaymentMethodOnCart(
            input: {
                cart_id: $cartId,
                payment_method: {
                    code: "paytrail",
                    paytrail: {
                        provider: $providerId
                    }
                }
            }
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
