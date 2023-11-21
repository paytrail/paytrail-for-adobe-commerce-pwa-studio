
import {gql} from '@apollo/client';

export const PLACE_ORDER = gql`
    mutation placeOrder($cartId: String!) {
        placeOrder(
            input: { cart_id: $cartId }
        ) @connection(key: "placeOrder") {
            order {
                order_number
                paytrail_payment_details {
                    payment_url
                    error
                    payment_form {
                        action
                        method
                        inputs {
                            name
                            value
                            type
                        }
                    }
                }
            }
        }
    }
`;

export const RESTORE_QUOTE = gql`
    mutation restoreQuote($cartId: String!) {
        restoreQuote(input: { cart_id: $cartId })
    }
`;

export default {
    placePaytrailOrderMutation: PLACE_ORDER,
    restoreQuoteMutation: RESTORE_QUOTE
};
