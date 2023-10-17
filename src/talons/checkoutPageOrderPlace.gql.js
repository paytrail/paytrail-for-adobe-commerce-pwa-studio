
import {gql} from '@apollo/client';

export const PLACE_ORDER = gql`
    mutation placeOrder($cartId: String!) {
        placeOrder(
            input: { cart_id: $cartId }
        ) @connection(key: "placeOrder") {
            order {
                order_number
                paytrail_payment_url {
                    payment_url
                    error
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
