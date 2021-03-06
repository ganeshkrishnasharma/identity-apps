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
 *
 */

import { AlertLevels } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { TemplateCardTagInterface } from "@wso2is/react-components";
import _ from "lodash";
import { getApplicationTemplateList, getAvailableInboundProtocols } from "../api";
import { CustomApplicationTemplate } from "../components/applications/meta";
import { TechnologyLogos } from "../configs";
import { ApplicationManagementConstants } from "../constants";
import {
    ApplicationTemplateListInterface,
    ApplicationTemplateListItemInterface,
    AuthProtocolMetaListItemInterface,
    MainApplicationInterface
} from "../models";
import { store } from "../store";
import { setApplicationTemplates, setAvailableInboundAuthProtocolMeta } from "../store/actions";

/**
 * Utility class for application(service provider) operations.
 */
export class ApplicationManagementUtils {

    /**
     * Private constructor to avoid object instantiation from outside
     * the class.
     *
     * @hideconstructor
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() { }

    /**
     * Gets the list of available inbound protocols list and sets them in the redux store.
     *
     * @param {AuthProtocolMetaListItemInterface[]} meta - Meta data to filter.
     * @param {boolean} customOnly - Whether to fetch just the custom protocols.
     */
    public static getInboundProtocols(meta: AuthProtocolMetaListItemInterface[], customOnly = false): Promise<void> {
        return getAvailableInboundProtocols(customOnly)
            .then((response) => {
                // Filter meta based on the available protocols.
                const filteredMeta = _.intersectionBy(meta, response, "name");

                store.dispatch(
                    setAvailableInboundAuthProtocolMeta(_.unionBy<AuthProtocolMetaListItemInterface>(filteredMeta,
                        response, "name"))
                );
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.description) {
                    store.dispatch(addAlert({
                        description: error.response.data.description,
                        level: AlertLevels.ERROR,
                        message:  "Retrieval error"
                    }));

                    return;
                }

                store.dispatch(addAlert({
                    description: "An error occurred retrieving the available inbound protocols.",
                    level: AlertLevels.ERROR,
                    message: "Retrieval error"
                }));
            });
    }

    /**
     * Retrieve Application template list form the API and sets it in redux state.
     */
    public static getApplicationTemplates = (): Promise<void> => {
        return getApplicationTemplateList()
            .then((response) => {
                const applicationTemplates = (response as ApplicationTemplateListInterface).templates;

                // Add on the custom application template to the application template list
                applicationTemplates.unshift(CustomApplicationTemplate);

                // Generate the technologies array.
                applicationTemplates.forEach((template) => {
                    template.types = ApplicationManagementUtils.buildSupportedTechnologies(template.types);
                });

                store.dispatch(setApplicationTemplates(applicationTemplates));
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.description) {
                    store.dispatch(addAlert({
                        description: error.response.data.description,
                        level: AlertLevels.ERROR,
                        message: "Application Template List Fetch Error"
                    }));

                    return;
                }

                store.dispatch(addAlert({
                    description: "An error occurred while retrieving application template list",
                    level: AlertLevels.ERROR,
                    message: "Retrieval Error"
                }));
            })
    };

    /**
     * Appends template name to the application description.
     * TODO: This is a temporary solution. Revert back once SP -> Template mapping is available.
     *
     * @param {MainApplicationInterface} application - Application details.
     * @param {ApplicationTemplateListItemInterface} template - Template object.
     *
     * @return {MainApplicationInterface} Modified Application object.
     */
    public static prefixTemplateNameToDescription(
        application: MainApplicationInterface, template: ApplicationTemplateListItemInterface
    ): MainApplicationInterface {

        if (!template || !template.name) {
            return application;
        }

        return {
            ...application,
            description: template.name
                + ApplicationManagementConstants.APPLICATION_DESCRIPTION_SPLITTER
                + application.description
        };
    }

    /**
     * Resolves the template name and description when the raw description string is passed in.
     * TODO: This is a temporary solution. Revert back once SP -> Template mapping is available.
     *
     * @param {string} description - Raw description string.
     *
     * @return {(string | null)[]} Template name and Description as tuple.
     */
    public static resolveApplicationTemplateNameInDescription(description: string): (string | null)[] {

        if (!description || typeof description !== "string") {
            return [ null, description ];
        }

        const tokens = description.split(ApplicationManagementConstants.APPLICATION_DESCRIPTION_SPLITTER);

        if(tokens.length <= 1) {
            return [ null, description ];
        }

        const [ template, ...desc ] = tokens;

        return [ template, desc.join(ApplicationManagementConstants.APPLICATION_DESCRIPTION_SPLITTER) ];
    }

    /**
     * Build supported technologies list for UI from the given technology types.
     *
     * @param {string[]} technologies - Set of supported technologies.
     *
     * @return {TemplateCardTagInterface[]} Set of Technologies compatible for `TemplateCard`.
     */
    public static buildSupportedTechnologies(technologies: string[]): TemplateCardTagInterface[] {
        return technologies?.map((technology: string) => {
            let logo = null;

            for (const [ key, value ] of Object.entries(TechnologyLogos)) {
                if (key === technology) {
                    logo = value;
                    break;
                }
            }

            return {
                displayName: _.startCase(technology),
                logo,
                name: technology
            }
        });
    }

    /**
     * Finds the icon from the given object.
     *
     * @param imageName Name on the image to be found.
     * @param illustrationObject Collection of images.
     */
    public static findIcon(imageName: string, illustrationObject) {
        const key: string = Object.keys(illustrationObject).find((key) => key === imageName);
        if (key) {
            return illustrationObject[key];
        } else {
            return imageName;
        }
    }
}
