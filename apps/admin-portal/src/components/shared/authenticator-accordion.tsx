/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { GenericIcon, GenericIconProps } from "@wso2is/react-components";
import { SegmentedAccordion, SegmentedAccordionTitlePropsInterface } from "@wso2is/react-components";
import _ from "lodash";
import React, {
    FunctionComponent,
    ReactElement,
    SyntheticEvent,
    useState
} from "react";

/**
 * Proptypes for the Authenticator Accordion component.
 */
export interface AuthenticatorAccordionPropsInterface {
    /**
     * Set of authenticators.
     */
    authenticators: AuthenticatorAccordionItemInterface[];
    /**
     * Initial activeIndexes value.
     */
    defaultActiveIndexes?: number[];
    /**
     * Accordion actions.
     */
    globalActions?: SegmentedAccordionTitlePropsInterface["actions"];
    /**
     * Hides the chevron icon.
     */
    hideChevron?: SegmentedAccordionTitlePropsInterface["hideChevron"];
    /**
     * Attribute to sort the array.
     */
    orderBy?: string;
}

/**
 * Authenticator interface.
 */
export interface AuthenticatorAccordionItemInterface {
    /**
     * Accordion actions.
     */
    actions?: SegmentedAccordionTitlePropsInterface["actions"];
    /**
     * Unique id for the authenticator.
     */
    id: string;
    /**
     * Flag to show/hide the authenticator inside the accordion.
     */
    hidden?: boolean;
    /**
     * Title of the authenticator.
     */
    title: string;
    /**
     * Icon for the authenticator
     */
    icon?: GenericIconProps;
    /**
     * Authenticator form.
     */
    content: ReactElement;
}

/**
 * Authenticator accordion component.
 *
 * @param {AuthenticatorAccordionPropsInterface} props - Props injected to the component.
 * @return {ReactElement}
 */
export const AuthenticatorAccordion: FunctionComponent<AuthenticatorAccordionPropsInterface> = (
    props: AuthenticatorAccordionPropsInterface
): ReactElement => {

    const {
        globalActions,
        authenticators,
        defaultActiveIndexes,
        hideChevron,
        orderBy
    } = props;

    const [ accordionActiveIndexes, setAccordionActiveIndexes ] = useState<number[]>(defaultActiveIndexes);

    /**
     * Handles accordion title click.
     *
     * @param {React.SyntheticEvent} e - Click event.
     * @param {number} index - Clicked on index.
     */
    const handleAccordionOnClick = (e: SyntheticEvent, { index }: { index: number }): void => {
        const newIndexes = [ ...accordionActiveIndexes ];

        if (newIndexes.includes(index)) {
            const removingIndex = newIndexes.indexOf(index);
            newIndexes.splice(removingIndex, 1);
        } else {
            newIndexes.push(index);
        }

        setAccordionActiveIndexes(newIndexes);
    };

    return (
        <SegmentedAccordion
            fluid
        >
            {
                _.sortBy(authenticators, orderBy).map((authenticator, index) => (
                    !authenticator.hidden
                        ? (
                            <>
                                <SegmentedAccordion.Title
                                    id={ authenticator.id }
                                    active={ accordionActiveIndexes.includes(index) }
                                    index={ index }
                                    onClick={ handleAccordionOnClick }
                                    content={ (
                                        <>
                                            <GenericIcon
                                                floated="left"
                                                size="micro"
                                                spaced="right"
                                                transparent
                                                { ...authenticator.icon }
                                            />
                                            { authenticator.title }
                                        </>
                                    ) }
                                    actions={ authenticator.actions && [ ...authenticator.actions, ...globalActions ] }
                                    hideChevron={ hideChevron }
                                />
                                <SegmentedAccordion.Content
                                    active={ accordionActiveIndexes.includes(index) }
                                >
                                    { authenticator.content }
                                </SegmentedAccordion.Content>
                            </>
                        )
                        : null
                ))
            }
        </SegmentedAccordion>
    );
};

/**
 * Default props for the authenticator accordion component.
 */
AuthenticatorAccordion.defaultProps = {
    defaultActiveIndexes: [ -1 ],
    hideChevron: false,
    orderBy: undefined
};
