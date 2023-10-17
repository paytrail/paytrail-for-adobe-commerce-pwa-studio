/**
 * Custom intercept file for the extension
 * By default you can only use target of @magento/pwa-buildpack.
 *
 * If do want to extend @magento/peregrine or @magento/venia-ui
 * you should add them to peerDependencies to your package.json
 *
 * If you want to add overwrites for @magento/venia-ui components you can use
 * moduleOverrideWebpackPlugin and componentOverrideMapping
 */
module.exports = targets => {
    const peregrineTargets = targets.of('@magento/peregrine');
    const talonsTarget = peregrineTargets.talons;
    const veniaTargets = targets.of('@magento/venia-ui');
    const {checkoutPagePaymentTypes} = targets.of('@magento/venia-ui');

    targets.of('@magento/pwa-buildpack').specialFeatures.tap(flags => {
        /**
         *  We need to activated esModules and cssModules to allow build pack to load our extension
         * {@link https://magento.github.io/pwa-studio/pwa-buildpack/reference/configure-webpack/#special-flags}.
         */
        flags[targets.name] = {
            esModules: true,
            cssModules: true,
            graphqlQueries: true
        };

    });

    veniaTargets.routes.tap(routesArray => {
        routesArray.push({
            name: 'Checkout Success Page',
            pattern:
                '/checkout/success/:order?/maskedId/:maskedId?',
            path:
                '@paytrail/paytrail-for-adobe-commerce-pwa-studio/src/components/successPage'
        });

        return routesArray;
    });

    checkoutPagePaymentTypes.tap((payments) =>
        payments.add({
            paymentCode: "paytrail",
            importPath: "@paytrail/paytrail-for-adobe-commerce-pwa-studio/src/components/paytrail.js"

        })
    );

    talonsTarget.tap(talonWrapperConfig => {
        talonWrapperConfig.CheckoutPage.useCheckoutPage.wrapWith(
            '@paytrail/paytrail-for-adobe-commerce-pwa-studio/src/plugins/checkoutPageTalonPlugin'
        );
    });

    talonsTarget.tap(talonWrapperConfig => {
        talonWrapperConfig.CartPage.useCartPage.wrapWith(
            '@paytrail/paytrail-for-adobe-commerce-pwa-studio/src/plugins/cartPageTalonPlugin'
        );
    });
}
