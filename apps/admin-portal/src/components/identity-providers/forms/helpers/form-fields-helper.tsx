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

import {
    Field,
    FormValue
} from "@wso2is/forms";
import { Hint } from "@wso2is/react-components";
import { FormValidation } from "@wso2is/validation";
import React, { ReactElement } from "react";
import {
    CommonPluggableComponentMetaPropertyInterface,
    CommonPluggableComponentPropertyInterface
} from "../../../../models";

export const getConfidentialField = (eachProp: CommonPluggableComponentPropertyInterface,
                                     propertyMetadata: CommonPluggableComponentMetaPropertyInterface,
                                     disable: boolean): ReactElement => {
    return (
        <>
            <Field
                showPassword="Show Secret"
                hidePassword="Hide Secret"
                label={ propertyMetadata?.displayName }
                name={ propertyMetadata?.key }
                placeholder={ propertyMetadata?.defaultValue }
                required={ propertyMetadata?.isMandatory }
                requiredErrorMessage={ "This is required" }
                value={ eachProp?.value }
                type="password"
                disabled={ disable }
            />
            { propertyMetadata?.description && (
                <Hint disabled={ disable }>{ propertyMetadata?.description }</Hint>
            )}
        </>
    );
};

export const getCheckboxField = (eachProp: CommonPluggableComponentPropertyInterface,
                                 propertyMetadata: CommonPluggableComponentMetaPropertyInterface,
                                 disable: boolean): ReactElement => {
    return (
        <>
            <Field
                name={ propertyMetadata?.key }
                key={ propertyMetadata?.key }
                type="checkbox"
                required={ propertyMetadata?.isMandatory }
                value={ (eachProp?.value == "true") ? [eachProp?.key] : [] }
                requiredErrorMessage="This is required"
                children={
                    [
                        {
                            label: propertyMetadata?.displayName,
                            value: eachProp?.key
                        }
                    ]
                }
                disabled={ disable }
            />
            { propertyMetadata?.description && (
                <Hint disabled={ disable }>{ propertyMetadata?.description }</Hint>
            )}
        </>
    );
};

export const getCheckboxFieldWithListener = (eachProp: CommonPluggableComponentPropertyInterface,
                                             propertyMetadata: CommonPluggableComponentMetaPropertyInterface,
                                             listen: (key: string, values: Map<string, FormValue>) => void,
                                             disable: boolean): ReactElement => {
    return (
        <>
            <Field
                name={ propertyMetadata?.key }
                key={ propertyMetadata?.key }
                type="checkbox"
                required={ propertyMetadata?.isMandatory }
                value={ eachProp?.value ? [eachProp?.key] : [] }
                requiredErrorMessage="This is required"
                children={
                    [
                        {
                            label: propertyMetadata?.displayName,
                            value: eachProp?.key
                        }
                    ]
                }
                listen={ (values: Map<string, FormValue>) => {
                    listen(propertyMetadata.key, values);
                } }
                disabled={ disable }
            />
            { propertyMetadata?.description && (
                <Hint disabled={ disable }>{ propertyMetadata?.description }</Hint>
            )}
        </>
    );
};

export const getTextField = (eachProp: CommonPluggableComponentPropertyInterface,
                             propertyMetadata: CommonPluggableComponentMetaPropertyInterface,
                             disable: boolean): ReactElement => {
    return (
        <>
            <Field
                name={ propertyMetadata?.key }
                label={ propertyMetadata?.displayName }
                required={ propertyMetadata?.isMandatory }
                requiredErrorMessage="This is required"
                placeholder={ propertyMetadata?.defaultValue }
                type="text"
                value={ eachProp?.value }
                key={ eachProp?.key }
                disabled={ disable }
            />
            { propertyMetadata?.description && (
                <Hint disabled={ disable }>{ propertyMetadata?.description }</Hint>
            )}
        </>
    );
};

export const getURLField = (eachProp: CommonPluggableComponentPropertyInterface,
                            propertyMetadata: CommonPluggableComponentMetaPropertyInterface,
                            disable: boolean): ReactElement => {
    return (
        <>
            <Field
                name={ propertyMetadata?.key }
                label={ propertyMetadata?.displayName }
                required={ propertyMetadata?.isMandatory }
                requiredErrorMessage="This is required"
                placeholder={ propertyMetadata?.defaultValue }
                validation={ (value, validation) => {
                    if (!FormValidation.url(value)) {
                        validation.isValid = false;
                        validation.errorMessages.push("This is not a valid URL");
                    }
                } }
                type="text"
                value={ eachProp?.value }
                key={ propertyMetadata?.key }
                disabled={ disable }
            />
            { propertyMetadata?.description && (
                <Hint disabled={ disable }>{ propertyMetadata?.description }</Hint>
            )}
        </>
    );
};

export const getQueryParamsField = (eachProp: CommonPluggableComponentPropertyInterface,
                                    propertyMetadata: CommonPluggableComponentMetaPropertyInterface,
                                    disable: boolean): ReactElement => {
    return (
        <>
            <Field
                name={ propertyMetadata?.key }
                label={ propertyMetadata?.displayName }
                required={ propertyMetadata?.isMandatory }
                requiredErrorMessage="This is required"
                validation={ (value, validation) => {
                    if (!FormValidation.url("https://www.sample.com?" + value)) {
                        validation.isValid = false;
                        validation.errorMessages.push("These are not valid query parameters");
                    }
                } }
                type="queryParams"
                value={ eachProp?.value }
                key={ propertyMetadata?.key }
                disabled={ disable }
            />
            { propertyMetadata?.description && (
                <Hint disabled={ disable }>{ propertyMetadata?.description }</Hint>
            )}
        </>
    );
};

export const getDropDownField = (eachProp: CommonPluggableComponentPropertyInterface,
                                 propertyMetadata: CommonPluggableComponentMetaPropertyInterface,
                                 disable: boolean): ReactElement => {
    return (
        <>
            <Field
                name={ eachProp?.key }
                label={ propertyMetadata?.displayName }
                required={ propertyMetadata?.isMandatory }
                requiredErrorMessage="This is required"
                type="dropdown"
                value={ eachProp?.value }
                key={ eachProp?.key }
                children={ getDropDownChildren(eachProp?.key, propertyMetadata?.options) }
                disabled={ disable }
            />
            { propertyMetadata?.description && (
                <Hint disabled={ disable }>{ propertyMetadata?.description }</Hint>
            )}
        </>
    );
};

const getDropDownChildren = (key: string, options: string[]) => {
    return options.map((option) => {
        return ({
            key: key,
            text: option,
            value: option
        });
    })
};

/**
 * Each field type.
 */
export enum FieldType {
    CHECKBOX = "CheckBox",
    TEXT = "Text",
    CONFIDENTIAL = "Confidential",
    URL = "URL",
    QUERY_PARAMS = "QueryParameters",
    DROP_DOWN = "DropDown"
}

/**
 * commonly used constants.
 */
export enum CommonConstants {
    BOOLEAN = "BOOLEAN",
    FIELD_COMPONENT_KEYWORD_URL = "URL",
    FIELD_COMPONENT_KEYWORD_QUERY_PARAMETER = "QUERYPARAM"
}

/**
 * Get interpreted field type for given property metada.
 *
 * @param propertyMetadata Property metadata of type {@link CommonPluggableComponentMetaPropertyInterface}.
 */
export const getFieldType = (propertyMetadata: CommonPluggableComponentMetaPropertyInterface): FieldType => {

    if (propertyMetadata?.type?.toUpperCase() === CommonConstants.BOOLEAN) {
        return FieldType.CHECKBOX;
    } else if (propertyMetadata?.isConfidential) {
        return FieldType.CONFIDENTIAL;
    } else if (propertyMetadata?.key.toUpperCase().includes(CommonConstants.FIELD_COMPONENT_KEYWORD_URL)) {
        // todo Need proper backend support to identity URL fields.
        return FieldType.URL;
    } else if (propertyMetadata?.key.toUpperCase().includes(
        CommonConstants.FIELD_COMPONENT_KEYWORD_QUERY_PARAMETER)) {
        // todo Need proper backend support to identity Query parameter fields.
        return FieldType.QUERY_PARAMS;
    } else if (propertyMetadata?.options?.length > 0) {
        return FieldType.DROP_DOWN;
    }
    return FieldType.TEXT;
};

/**
 * Get corresponding {@link Field} component for the provided property.
 *
 * @param property Property of type {@link CommonPluggableComponentPropertyInterface}.
 * @param propertyMetadata Property metadata of type.
 * @param disable Disables the form field.
 * @param listen Listener method for the on change events of a checkbox field
 * @return Corresponding property field.
 */
export const getPropertyField = (property: CommonPluggableComponentPropertyInterface,
                                 propertyMetadata: CommonPluggableComponentMetaPropertyInterface,
                                 disable?: boolean,
                                 listen?: (key: string, values: Map<string, FormValue>) => void):
    ReactElement => {

    switch (getFieldType(propertyMetadata)) {
        case FieldType.CHECKBOX : {
            if (listen) {
                return getCheckboxFieldWithListener(property, propertyMetadata, listen, disable);
            }
            return getCheckboxField(property, propertyMetadata, disable);
        }
        case FieldType.CONFIDENTIAL : {
            return getConfidentialField(property, propertyMetadata, disable);
        }
        case FieldType.URL : {
            return getURLField(property, propertyMetadata, disable);
        }
        case FieldType.QUERY_PARAMS : {
            return getQueryParamsField(property, propertyMetadata, disable);
        }
        case FieldType.DROP_DOWN : {
            return getDropDownField(property, propertyMetadata, disable);
        }
        default: {
            return getTextField(property, propertyMetadata, disable);
        }
    }
};
