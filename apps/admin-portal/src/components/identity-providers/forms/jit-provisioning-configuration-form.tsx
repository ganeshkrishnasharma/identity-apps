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

import { Button, Divider, Grid } from "semantic-ui-react";
import { Field, Forms } from "@wso2is/forms";
import { Heading, Hint } from "@wso2is/react-components";
import {
    IdentityProviderInterface,
    JITProvisioningResponseInterface,
    SimpleUserStoreListItemInterface,
    SupportedJITProvisioningSchemes
} from "../../../models";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";

/**
 *  Just-in time provisioning configurations for the IdP.
 */
interface JITProvisioningConfigurationFormPropsInterface {
    onSubmit: (values: IdentityProviderInterface) => void;
    initialValues: JITProvisioningResponseInterface;
    useStoreList: SimpleUserStoreListItemInterface[];
}

enum JITProvisioningConstants {
    ENABLE_JIT_PROVISIONING_KEY = "enableJITProvisioning",
    PROVISIONING_USER_STORE_DOMAIN_KEY = "provisioningUserstoreDomain",
    PROVISIONING_SCHEME_TYPE_KEY = "provisioningScheme"
}

/**
 * Just-in time Provisioning configurations form component.
 *
 * @param {JITProvisioningConfigurationFormPropsInterface} props - Props injected to the component.
 * @return {ReactElement}
 */
export const JITProvisioningConfigurationsForm: FunctionComponent<JITProvisioningConfigurationFormPropsInterface> = (
    props: JITProvisioningConfigurationFormPropsInterface
): ReactElement => {

    const {
        initialValues,
        onSubmit,
        useStoreList
    } = props;

    const [isJITProvisioningEnabled, setIsJITProvisioningEnabled] = useState<boolean>(false);

    /**
     * Prepare form values for submitting.
     *
     * @param values - Form values.
     * @return {any} Sanitized form values.
     */
    const updateConfiguration = (values: any): any => {
        return {
            ...initialValues,
            isEnabled: values.get(JITProvisioningConstants.ENABLE_JIT_PROVISIONING_KEY)
                .includes(JITProvisioningConstants.ENABLE_JIT_PROVISIONING_KEY),
            scheme: values.get(JITProvisioningConstants.PROVISIONING_SCHEME_TYPE_KEY),
            userstore: values.get(JITProvisioningConstants.PROVISIONING_USER_STORE_DOMAIN_KEY)
        } as JITProvisioningResponseInterface;
    };

    /**
     * Create user store options.
     *
     */
    const getUserStoreOption = () => {
        const allowedOptions = [];
        if (useStoreList) {
            useStoreList?.map((userStore) => {
                allowedOptions.push({
                    key: useStoreList.indexOf(userStore),
                    text: userStore?.name,
                    value: userStore?.name
                });
            });
        }

        return allowedOptions;
    };

    useEffect(() => {
        if (initialValues?.isEnabled) {
            setIsJITProvisioningEnabled(initialValues?.isEnabled)
        }
    }, [initialValues]);

    return (
        <Forms onSubmit={ (values) => onSubmit(updateConfiguration(values)) }>
            <Grid>
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Heading as="h5">Just-in-time Provisioning</Heading>
                        <Divider hidden/>
                        <Field
                            name={ JITProvisioningConstants.ENABLE_JIT_PROVISIONING_KEY }
                            label=""
                            required={ false }
                            requiredErrorMessage=""
                            value={
                                initialValues?.isEnabled ? [JITProvisioningConstants.ENABLE_JIT_PROVISIONING_KEY]
                                    : []
                            }
                            type="checkbox"
                            listen={
                                (values) => {
                                    setIsJITProvisioningEnabled(
                                        values.get(JITProvisioningConstants.ENABLE_JIT_PROVISIONING_KEY)
                                            .includes(JITProvisioningConstants.ENABLE_JIT_PROVISIONING_KEY)
                                    )
                                }
                            }
                            children={ [
                                {
                                    label: "Enable",
                                    value: JITProvisioningConstants.ENABLE_JIT_PROVISIONING_KEY
                                }
                            ] }
                        />
                        <Hint>
                            Specifies if users federated from this identity provider needs to be provisioned locally.
                        </Hint>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            name={ JITProvisioningConstants.PROVISIONING_USER_STORE_DOMAIN_KEY }
                            label="User store domain to always provision users"
                            required={ false }
                            requiredErrorMessage=""
                            type="dropdown"
                            default={ useStoreList && useStoreList.length > 0 && useStoreList[0].name }
                            value={ initialValues?.userstore }
                            children={ getUserStoreOption() }
                            disabled={ !isJITProvisioningEnabled }
                        />
                        <Hint>
                            Select user store domain name to provision users.
                        </Hint>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            label="Provisioning scheme"
                            name={ JITProvisioningConstants.PROVISIONING_SCHEME_TYPE_KEY }
                            default={ initialValues?.scheme ? initialValues?.scheme :
                                SupportedJITProvisioningSchemes.PROMPT_USERNAME_PASSWORD_CONSENT }
                            type="radio"
                            children={ [
                                {
                                    label: "Prompt for username, password and consent",
                                    value: SupportedJITProvisioningSchemes.PROMPT_USERNAME_PASSWORD_CONSENT
                                },
                                {
                                    label: "Prompt for password and consent",
                                    value: SupportedJITProvisioningSchemes.PROMPT_PASSWORD_CONSENT
                                },
                                {
                                    label: "Prompt for consent",
                                    value: SupportedJITProvisioningSchemes.PROMPT_CONSENT
                                },
                                {
                                    label: "Provision silently",
                                    value: SupportedJITProvisioningSchemes.PROVISION_SILENTLY
                                }
                            ] }
                            disabled={ !isJITProvisioningEnabled }
                        />
                        <Hint>
                            Select the scheme to be used, when users are provisioned.
                        </Hint>
                    </Grid.Column>
                </Grid.Row>
                
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Button primary type="submit" size="small" className="form-button">
                            Update
                        </Button>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Forms>
    );
};
