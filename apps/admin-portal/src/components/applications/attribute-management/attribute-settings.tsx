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

import { AlertLevels, CRUDPermissionsInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { useTrigger } from "@wso2is/forms";
import _ from "lodash";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Grid } from "semantic-ui-react";
import { AdvanceAttributeSettings } from "./advance-attribute-settings";
import { AttributeSelection } from "./attribute-selection";
import { RoleMapping } from "./role-mapping";
import { getAllExternalClaims, getAllLocalClaims, getDialects, updateClaimConfiguration } from "../../../api/";
import {
    AuthProtocolMetaListItemInterface,
    Claim,
    ClaimConfigurationInterface,
    ClaimDialect,
    ClaimMappingInterface,
    ExternalClaim,
    RoleConfigInterface,
    RoleMappingInterface,
    SubjectConfigInterface,
    SupportedAuthProtocolTypes
} from "../../../models";

export interface SelectedDialectInterface {
    dialectURI: string;
    id: string;
    localDialect: boolean;
}

export interface DropdownOptionsInterface {
    key: string;
    text: string;
    value: string;
}

export interface ExtendedClaimMappingInterface extends ClaimMappingInterface {
    addMapping?: boolean;
}

export interface ExtendedClaimInterface extends Claim {
    mandatory?: boolean;
    requested?: boolean;
}

export interface ExtendedExternalClaimInterface extends ExternalClaim {
    mandatory?: boolean;
    requested?: boolean;
}

export interface AdvanceSettingsSubmissionInterface {
    subject: SubjectConfigInterface;
    role: RoleConfigInterface;
}

interface AttributeSelectionPropsInterface {
    /**
     * Id of the application.
     */
    appId: string;
    /**
     * Claim configurations.
     */
    claimConfigurations: ClaimConfigurationInterface;
    /**
     * Selected inbound protocol.
     */
    selectedInboundProtocol: AuthProtocolMetaListItemInterface[];
    /**
     * CRUD permissions,
     */
    permissions?: CRUDPermissionsInterface;
}

export const getLocalDialectURI = (): string => {

    let localDialect = "http://wso2.org/claims";
    getAllLocalClaims(null)
        .then((response) => {
            // setClaims(response.slice(0, 10));
            const retrieved = response.slice(0, 1)[0].dialectURI;
            if (!_.isEmpty(retrieved)) {
                localDialect = retrieved;
            }
        });
    return localDialect;
};

export const LocalDialectURI = "http://wso2.org/claims";

export const AttributeSettings: FunctionComponent<AttributeSelectionPropsInterface> = (
    props
): ReactElement => {

    const {
        appId,
        claimConfigurations,
        selectedInboundProtocol
    } = props;

    const dispatch = useDispatch();

    // Manage Local Dialect URI
    const [localDialectURI, setLocalDialectURI] = useState("");

    // available dialects.
    const [dialect, setDialect] = useState<ClaimDialect[]>([]);

    // Manage selected dialect
    const [selectedDialect, setSelectedDialect] = useState<SelectedDialectInterface>();

    // Manage available claims in local and external dialects.
    const [isClaimRequestLoading, setIsClaimRequestLoading] = useState(true);
    const [claims, setClaims] = useState<ExtendedClaimInterface[]>([]);
    const [externalClaims, setExternalClaims] = useState<ExtendedExternalClaimInterface[]>([]);

    // Selected claims in local and external dialects.
    const [selectedClaims, setSelectedClaims] = useState<ExtendedClaimInterface[]>([]);
    const [selectedExternalClaims, setSelectedExternalClaims] = useState<ExtendedExternalClaimInterface[]>([]);

    // Mapping operation.
    const [claimMapping, setClaimMapping] = useState<ExtendedClaimMappingInterface[]>([]);
    const [claimMappingOn, setClaimMappingOn] = useState(false);
    // Form submitted with EmptyClaim Mapping
    const [claimMappingError, setClaimMappingError] = useState(false);

    //Advance Settings.
    const [advanceSettingValues, setAdvanceSettingValues] = useState<AdvanceSettingsSubmissionInterface>();
    const [triggerAdvanceSettingFormSubmission, setTriggerAdvanceSettingFormSubmission] = useTrigger();

    // Role Mapping.
    const [roleMapping, setRoleMapping] = useState<RoleMappingInterface[]>([]);

    const getClaims = () => {
        getAllLocalClaims(null)
            .then((response) => {
                setClaims(response);
            })
            .catch((error) => {
                dispatch(addAlert({
                    description: "An error occurred while retrieving local claims.",
                    level: AlertLevels.ERROR,
                    message: "Get Error"
                }));
            });
    };

    const getAllDialects = () => {
        getDialects(null)
            .then((response) => {
                setDialect(response);
            })
            .catch((error) => {
                dispatch(addAlert({
                    description: "An error occurred while retrieving dialects.",
                    level: AlertLevels.ERROR,
                    message: "Get Error"
                }));
            });
    };

    const getMappedClaims = (newClaimId) => {
        if (newClaimId !== null) {
            getAllExternalClaims(newClaimId, null)
                .then((response) => {
                    setIsClaimRequestLoading(true);
                    setExternalClaims(response);
                })
                .catch((error) => {
                    dispatch(addAlert({
                        description: "An error occurred while retrieving external claims.",
                        level: AlertLevels.ERROR,
                        message: "Get Error"
                    }));
                })
                .finally(() => {
                    setIsClaimRequestLoading(false);
                });
        }
    };

    const findDialectID = (value) => {
        let id = "";
        dialect.map((element: ClaimDialect) => {
            if (element.dialectURI === value) {
                id = element.id;
            }
        });
        return id;
    };

    const createMapping = (claim: Claim) => {

        if (selectedDialect.localDialect) {
            const claimMappingList: ExtendedClaimMappingInterface[] = [...claimMapping];
            const newClaimMapping: ExtendedClaimMappingInterface = {
                applicationClaim: "",
                localClaim: {
                    displayName: claim.displayName,
                    id: claim.id,
                    uri: claim.claimURI
                },
                addMapping: false
            };
            if (!(claimMappingList.filter((claimMap) => claimMap.localClaim.uri === claim.claimURI).length > 0)) {
                claimMappingList.push(newClaimMapping);
            }
            setClaimMapping(claimMappingList);
        }

    };

    const removeMapping = (claim: Claim) => {
        const claimMappingList = [...claimMapping];
        const mappedClaim = claimMappingList.map((mapping) => {
            if (mapping.localClaim.uri === claim.claimURI) {
                return mapping;
            }
        });
        claimMappingList.splice(claimMappingList.indexOf(mappedClaim[0]), 1);
        setClaimMapping(claimMappingList);
    };

    const getCurrentMapping = (claimURI: string): ExtendedClaimMappingInterface => {
        const claimMappingList = [...claimMapping];
        let result: ExtendedClaimMappingInterface;
        claimMappingList.map((mapping) => {
            if (mapping.localClaim.uri === claimURI) {
                result = mapping
            }
        });
        return result;
    };

    // Update mapping value
    const updateClaimMapping = (claimURI: string, mappedValue: string) => {
        const claimMappingList = [...claimMapping];
        claimMappingList.forEach((mapping) => {
            if (mapping.localClaim.uri === claimURI) {
                mapping.applicationClaim = mappedValue;
            }
        });
        setClaimMapping(claimMappingList);
    };

    // Decide whether to use mapping or not
    const addToClaimMapping = (claimURI: string, addMapping: boolean) => {
        const claimMappingList = [...claimMapping];
        claimMappingList.forEach((mapping) => {
            if (mapping.localClaim.uri === claimURI) {
                mapping.addMapping = addMapping;
            }
        });
        setClaimMapping(claimMappingList);
    };

    const createOptions = () => {
        const newDialectOptions: DropdownOptionsInterface[] = [];
        // tslint:disable-next-line:no-shadowed-variable
        dialect.map((element: ClaimDialect) => {
            const option: DropdownOptionsInterface = {
                key: element.id,
                text: element.dialectURI,
                value: element.dialectURI
            };
            newDialectOptions.push(option);
        });
        return newDialectOptions;
    };

    const selectDialect = (e, { name, value }) => {
        if (value !== null && selectedDialect.dialectURI !== value) {
            const selectedId = findDialectID(value);
            let isLocalDialect = selectedDialect.localDialect;
            if (value !== localDialectURI) {
                isLocalDialect = false;
            } else {
                isLocalDialect = true;
            }
            setSelectedDialect({
                dialectURI: value,
                id: selectedId,
                localDialect: isLocalDialect
            });
            setSelectedExternalClaims([]);
            setSelectedClaims([]);
            getMappedClaims(selectedId);
        }
    };

    const changeSelectedDialect = (dialectURI: string) => {
        if (dialectURI !== null) {
            const selectedId = findDialectID(dialectURI);
            let isLocalDialect = true;
            if (dialectURI !== localDialectURI) {
                isLocalDialect = false;
            }
            setSelectedDialect({
                dialectURI: dialectURI,
                id: selectedId,
                localDialect: isLocalDialect
            });
            if (!isLocalDialect) {
                getMappedClaims(selectedId);
            }
        }
    };

    // Set local claim URI and maintain it in a state
    const findLocalClaimDialectURI = () => {
        getLocalDialectURI();
        if (_.isEmpty(localDialectURI)) {
            setLocalDialectURI(getLocalDialectURI());
        }
    };

    const createDropdownOption = () => {
        const options: DropdownOptionsInterface[] = [];

        if (selectedDialect.localDialect) {
            if (claimMappingOn) {
                const claimMappingOption: DropdownOptionsInterface[] = [];
                claimMapping.map((element: ExtendedClaimMappingInterface) => {
                    let option: DropdownOptionsInterface;
                    if (!_.isEmpty(element.applicationClaim)) {
                        option = {
                            key: element.localClaim.id,
                            text: element.applicationClaim,
                            value: element.applicationClaim
                        };
                        claimMappingOption.push(option);
                    }
                });
                return claimMappingOption;
            } else {
                claims.map((element: ExtendedClaimInterface) => {
                    const option: DropdownOptionsInterface = {
                        key: element.id,
                        text: element.claimURI,
                        value: element.claimURI
                    };
                    options.push(option);
                });
            }
        } else {
            externalClaims.map((element: ExtendedExternalClaimInterface) => {
                const option: DropdownOptionsInterface = {
                    key: element.id,
                    text: element.claimURI,
                    value: element.mappedLocalClaimURI
                };
                options.push(option);
            });
        }

        return options;
    };

    const updateValues = () => {
        setTriggerAdvanceSettingFormSubmission();
    };

    /**
     *  Get the mapping for given URI
     */
    const getMapping = ((uri: string, claimMappings: ExtendedClaimMappingInterface[]) => {
        let requestURI = uri;
        if (claimMappings.length > 0) {
            requestURI = claimMappings.find(
                (mapping) => mapping?.localClaim?.uri === uri)?.applicationClaim;
        }
        return requestURI;
    });

    /**
     *  Generate final claim mapping list.
     */
    const getFinalMappingList = ((): ExtendedClaimMappingInterface[] => {
        const claimMappingFinal = [];
        let returnList = true;
        setClaimMappingError(false);
        const createdClaimMappings: ExtendedClaimMappingInterface[] = [...claimMapping];
        createdClaimMappings.map((claimMapping) => {
            if (claimMapping.addMapping) {
                if (_.isEmpty(claimMapping.applicationClaim)) {
                    setClaimMappingError(true)
                    returnList = false;
                } else {
                    const claimMappedObject: ExtendedClaimMappingInterface = {
                        applicationClaim: claimMapping.applicationClaim,
                        localClaim: {
                            uri: claimMapping.localClaim.uri
                        }
                    };
                    claimMappingFinal.push(claimMappedObject);
                }
            }
        });

        if (returnList) {
            return claimMappingFinal;
        } else {
            return null;
        }
    });

    const submitUpdateRequest = (claimMappingFinal) => {
        const RequestedClaims = [];
        if (selectedDialect.localDialect) {
            selectedClaims.map((claim: ExtendedClaimInterface) => {
                // If claim mapping is there then check whether claim is requested or not.
                const claimMappingURI = claimMappingFinal.length > 0 ?
                    getMapping(claim.claimURI, claimMappingFinal) : null;
                if (claimMappingURI) {
                    if (claim.requested) {
                        const requestedClaim = {
                            claim: {
                                uri: claimMappingURI
                            },
                            mandatory: claim.mandatory
                        };
                        RequestedClaims.push(requestedClaim);
                    }
                } else {
                    const requestedClaim = {
                        claim: {
                            uri: claim.claimURI
                        },
                        mandatory: claim.mandatory
                    };
                    RequestedClaims.push(requestedClaim);
                }
            })
        } else {
            selectedExternalClaims.map((claim: ExtendedExternalClaimInterface) => {
                const requestedClaim = {
                    claim: {
                        uri: claim.mappedLocalClaimURI
                    },
                    mandatory: claim.mandatory
                };
                RequestedClaims.push(requestedClaim);
            })
        }

        // Generate Final Submit value
        const submitValue = {
            claimConfiguration: {
                dialect: claimMappingFinal.length > 0 ? "CUSTOM" : "LOCAL",
                claimMappings: claimMappingFinal.length > 0 ? claimMappingFinal : [],
                requestedClaims: RequestedClaims,
                subject: {
                    claim: {
                        uri: advanceSettingValues?.subject.claim
                    },
                    includeUserDomain: advanceSettingValues?.subject.includeUserDomain,
                    includeTenantDomain: advanceSettingValues?.subject.includeTenantDomain,
                    useMappedLocalSubject: advanceSettingValues?.subject.useMappedLocalSubject
                },
                role: {
                    mappings: roleMapping.length > 0 ? roleMapping : [],
                    claim: {
                        uri: advanceSettingValues?.role.claim
                    },
                    includeUserDomain: advanceSettingValues?.role.includeUserDomain
                }
            }
        };

        if (_.isEmpty(submitValue.claimConfiguration.claimMappings)) {
            delete submitValue.claimConfiguration.claimMappings;
        }
        if (_.isEmpty(submitValue.claimConfiguration.role.mappings)) {
            delete submitValue.claimConfiguration.role.mappings;
        }

        updateClaimConfiguration(appId, submitValue)
            .then((response) => {
                dispatch(addAlert({
                    description: "Successfully updated the claim configuration.",
                    level: AlertLevels.SUCCESS,
                    message: "Update successful"
                }));
            })
            .catch((error) => {
                dispatch(addAlert({
                    description: "An error occurred while updating the claim configuration.",
                    level: AlertLevels.ERROR,
                    message: "Update error"
                }));
            });
    };

    useEffect(() => {
        getClaims();
        getAllDialects();
        findLocalClaimDialectURI();
    }, []);

    // Set the dialects for inbound protocols
    useEffect(() => {
        if (_.isEmpty(dialect)) {
            return
        }
        //TODO  move this logic to backend
        setIsClaimRequestLoading(true);
        if (selectedInboundProtocol.length === 1
            && selectedInboundProtocol[0]?.id === SupportedAuthProtocolTypes.OIDC) {
            setIsClaimRequestLoading(false);
            changeSelectedDialect("http://wso2.org/oidc/claim")
        } else {
            setIsClaimRequestLoading(false);
            changeSelectedDialect(localDialectURI);
        }
    }, [selectedInboundProtocol, dialect]);

    useEffect(() => {

        if (advanceSettingValues) {
            const mappingList = getFinalMappingList();
            if (mappingList !== null) {
                submitUpdateRequest(mappingList);
            }
        }
    }, [advanceSettingValues]);

    /**
     * Set initial value for claim mapping.
     */
    useEffect(() => {
        if (claimConfigurations.dialect === "CUSTOM") {
            setClaimMappingOn(true)
        }
    }, [claimConfigurations]);

    return (
        !isClaimRequestLoading && selectedDialect && !(_.isEmpty(claims) && _.isEmpty(externalClaims)) ?
            <Grid className="claim-mapping">
                <AttributeSelection
                    claims={ claims }
                    setClaims={ setClaims }
                    externalClaims={ externalClaims }
                    setExternalClaims={ setExternalClaims }
                    selectedClaims={ selectedClaims }
                    selectedExternalClaims={ selectedExternalClaims }
                    setSelectedClaims={ setSelectedClaims }
                    setSelectedExternalClaims={ setSelectedExternalClaims }
                    selectedDialect={ selectedDialect }
                    claimMapping={ claimMapping }
                    setClaimMapping={ setClaimMapping }
                    createMapping={ createMapping }
                    removeMapping={ removeMapping }
                    getCurrentMapping={ getCurrentMapping }
                    updateClaimMapping={ updateClaimMapping }
                    addToClaimMapping={ addToClaimMapping }
                    claimConfigurations={ claimConfigurations }
                    claimMappingOn={ claimMappingOn }
                    setClaimMappingOn={ setClaimMappingOn }
                    claimMappingError={ claimMappingError }
                />
                <AdvanceAttributeSettings
                    dropDownOptions={ createDropdownOption() }
                    triggerSubmission={ triggerAdvanceSettingFormSubmission }
                    setSubmissionValues={ setAdvanceSettingValues }
                    initialRole={ claimConfigurations.role }
                    initialSubject={ claimConfigurations.subject }
                    claimMappingOn={ claimMappingOn }
                />
                <RoleMapping
                    submitState={ triggerAdvanceSettingFormSubmission }
                    onSubmit={ setRoleMapping }
                    initialMappings={ claimConfigurations.role?.mappings }
                />
                <Grid.Row>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 3 }>
                        <Button
                            primary
                            size="small"
                            onClick={ updateValues }
                        >
                            Update
                        </Button>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            : null
    );
};
