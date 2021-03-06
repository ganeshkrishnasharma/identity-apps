/**
* Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the 'License'); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import { addAlert } from "@wso2is/core/store";
import { Field, FormValue, Forms, useTrigger } from "@wso2is/forms";
import { LinkButton, PrimaryButton } from "@wso2is/react-components";
import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Grid } from "semantic-ui-react";
import { patchUserStore, testConnection } from "../../../api";
import { JDBC } from "../../../constants";
import { AlertLevels, TestConnection, Type, UserStore, UserStoreProperty } from "../../../models";

/**
 * Type of the property object
 */
interface Property {
    name: string;
    description: string;
    value: string;
}

/**
 * Prop types of `EditConnectionDetails` component
 */
interface EditConnectionDetailsPropsInterface {
    /**
     * Userstore to be edited
     */
    userStore: UserStore;
    /**
     * Initiates an update
     */
    update: () => void;
    /**
     * userstore id
     */
    id: string;
    /**
     * The type meta data
     */
    type: Type;
}
const EditConnectionDetails = (
    props: EditConnectionDetailsPropsInterface
): ReactElement => {

    const { userStore, update, id, type } = props;

    const [ properties, setProperties ] = useState<Property[]>([]);
    const [ formValue, setFormValue ] = useState<Map<string, FormValue>>(null);

    const dispatch = useDispatch();

    const [ submit, setSubmit ] = useTrigger();



    useEffect(() => {
        if (type) {
            const mandatory = [];
            const tempFormValue = new Map<string, FormValue>();

            for (const property of type.properties.Mandatory) {
                const mandatoryProperty = userStore.properties.find((value: UserStoreProperty) => {
                    return value.name === property.name;
                });

                if (mandatoryProperty) {
                    const tempProperty = { ...mandatoryProperty, description: property.description }
                    mandatory.push(tempProperty);
                    tempFormValue.set(mandatoryProperty.name, mandatoryProperty.value);
                } else {
                    mandatory.push({
                        description: property.description,
                        name: property.name,
                        value: property.defaultValue
                    });
                }
            }
            setProperties(mandatory);
            setFormValue(tempFormValue);
        }
    }, [ type ]);

    const isBoolean = (value: string): boolean => {
        return value === "true" || value === "false" || value === "True" || value === "False";
    }

    return (
        <Grid>
            <Grid.Row columns={ 1 }>
                <Grid.Column width={ 8 }>
                    <Forms
                        submitState={ submit }
                        onChange={ (isPure: boolean, values: Map<string, FormValue>) => {
                            setFormValue(values);
                        } }
                        onSubmit={ (values: Map<string, FormValue>) => {

                            const data = properties.map((property: Property) => {
                                return {
                                    operation: "REPLACE",
                                    path: `/properties/${property.name}`,
                                    value: values.get(property.name).toString()
                                }
                            });

                            patchUserStore(id, data).then(() => {
                                dispatch(addAlert({
                                    description: "This userstore has been updated successfully!",
                                    level: AlertLevels.SUCCESS,
                                    message: "Userstore updated successfully!"
                                }));
                                update();
                            }).catch(error => {
                                dispatch(addAlert({
                                    description: error?.description
                                        || "An error occurred while updating the userstore.",
                                    level: AlertLevels.ERROR,
                                    message: error?.message || "Something went wrong"
                                }));
                            });
                        } }
                    >
                        {
                            properties?.map((property: Property, index: number) => {
                                const isPassword = property.name
                                    .toLocaleLowerCase()
                                    .includes("password");
                                if (isPassword) {
                                    return (
                                        <Field
                                            name={ property.name }
                                            type="password"
                                            key={ index }
                                            required={ true }
                                            label={ property.description.split("#")[ 0 ] }
                                            requiredErrorMessage={
                                                `${property.description.split("#")[ 0 ]} is  required`
                                            }
                                            showPassword="Show Password"
                                            hidePassword="Hide Password"
                                        />
                                    )
                                } else if (isBoolean(property.value)) {
                                    return (
                                        <Field
                                            name={ property.name }
                                            value={ property.value }
                                            type="toggle"
                                            key={ index }
                                            required={ true }
                                            label={ property.description.split("#")[ 0 ] }
                                            requiredErrorMessage={
                                                `${property.description.split("#")[ 0 ]} is  required`
                                            }
                                        />
                                    );
                                } else {
                                    return (
                                        <Field
                                            name={ property.name }
                                            value={ property.value }
                                            type="text"
                                            key={ index }
                                            required={ true }
                                            label={ property.description.split("#")[ 0 ] }
                                            requiredErrorMessage={
                                                `${property.description.split("#")[ 0 ]} is  required`
                                            }
                                        />
                                    );
                                }

                            })
                        }
                    </Forms>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={ 1 }>
                <Grid.Column width={ 8 }>
                    <PrimaryButton onClick={ () => { setSubmit() } }>
                        Update
                    </PrimaryButton>
                    <LinkButton
                        onClick={
                            () => {
                                if (type.typeName.includes(JDBC)) {
                                    const testData: TestConnection = {
                                        connectionPassword: formValue?.get("password").toString(),
                                        connectionURL: formValue?.get("url").toString(),
                                        driverName: formValue?.get("driverName").toString(),
                                        username: formValue?.get("userName").toString()
                                    };
                                    testConnection(testData).then(() => {
                                        dispatch(addAlert({
                                            description: "The connection is healthy",
                                            level: AlertLevels.SUCCESS,
                                            message: "Connection successful!"
                                        }));
                                    }).catch((error) => {
                                        dispatch(addAlert({
                                            description: error?.description
                                                || "An error occurred while testing the connection to the userstore",
                                            level: AlertLevels.ERROR,
                                            message: error?.message || "Something went wrong"
                                        }));
                                    })
                                }
                            }
                        }
                    >
                        Test Connection
                    </LinkButton>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
};

export const MemoEditConnectionDetails = React.memo(EditConnectionDetails);
