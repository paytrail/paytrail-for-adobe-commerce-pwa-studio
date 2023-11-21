import React, {useState} from 'react';
import {mergeClasses} from '@magento/venia-ui/lib/classify';
import defaultClasses from "./paymentOptions.css";
import GroupComponent from './Group/group';
import {Accordion, Section} from "@magento/venia-ui/lib/components/Accordion";


const PaymentOptions = (props) => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const [active, setActive] = useState(false);
    return (
        <Accordion
            canOpenMultiple={true}
        >
            {
                props.paytrailConfig?.paytrailConfigData.groups.map((group, index) => (
                    <Section
                        id={group.name}
                        title={group.name}
                        key={index}
                        data-cy="Section-titleContainer"
                        className={defaultClasses.paytrailOptions}
                    >
                        <GroupComponent
                            group={group}
                            setProviderId={props.setProviderId}
                            setActive={setActive}
                            active={active}
                        />
                    </Section>
                ))
            }
        </Accordion>


    );
};

PaymentOptions.defaultProps = {};

export default PaymentOptions;
