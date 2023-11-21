 import React, {useState} from 'react';
import defaultClasses from "./group.css";


const GroupComponent = (props) => {

    const handleClick = (method) => {
        props.setProviderId(method.id)
        props.setActive(method.id);
        console.log(method.id)

    };

    return (
        <div className={defaultClasses.group}>

            {props.group.providers.map(
                (method, index) => (
                    <div
                        className={[defaultClasses.method, props.active === method.id ? defaultClasses.active : undefined].join(" ")}
                        key={method.id}
                        onClick={() => handleClick(method)}
                    >
                        <img src={method.svg} className={defaultClasses.methodSvg} alt={method.name}/>
                    </div>
                )
            )
            }
        </div>
    );
};

export default GroupComponent;
