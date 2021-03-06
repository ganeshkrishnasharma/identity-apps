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

import { ImageUtils, URLUtils } from "@wso2is/core/utils";
import _ from "lodash";
import React, { ReactElement, ReactNode, SyntheticEvent, useEffect, useState } from "react";
import { Grid } from "semantic-ui-react";
import { LinkButton } from "../button";
import { TemplateCard, TemplateCardPropsInterface } from "../card";
import { Heading } from "../typography";

/**
 * Proptypes for the template grid component.
 */
interface TemplateGridPropsInterface<T> {
    /**
     * Empty placeholder
     */
    emptyPlaceholder?: ReactElement;
    /**
     * Heading for the grid.
     */
    heading?: ReactNode;
    /**
     * Callback to be fired on template selection.
     */
    onTemplateSelect: (e: SyntheticEvent, { id }: { id: string }) => void;
    /**
     * Enable/ Disable pagination.
     */
    paginate?: boolean;
    /**
     * Pagination limit.
     */
    paginationLimit?: number;
    /**
     * Grid pagination options.
     */
    paginationOptions?: TemplateGridPaginationOptionsInterface;
    /**
     * Sub heading for the grid.
     */
    subHeading?: ReactNode;
    /**
     * Title for the tags section.
     */
    tagsSectionTitle?: TemplateCardPropsInterface["tagsSectionTitle"];
    /**
     * List of templates.
     */
    templates: T[];
    /**
     * Template icons.
     */
    templateIcons?: object;
    /**
     * Grid type.
     */
    type: "application" | "idp";
}

/**
 * Interface for grid pagination options.
 */
export interface TemplateGridPaginationOptionsInterface {
    /**
     * Show more button label.
     */
    showMoreButtonLabel: string;
    /**
     * Show less button label.
     */
    showLessButtonLabel: string;
}

/**
 * Interface to extend the generic `T` interface in-order to access properties.
 */
interface WithPropertiesInterface {
    /**
     * Template description
     */
    description?: TemplateCardPropsInterface["description"];
    /**
     * Template ID.
     */
    id?: TemplateCardPropsInterface["id"];
    /**
     * Template image.
     */
    image?: TemplateCardPropsInterface["image"];
    /**
     * Template Name.
     */
    name: TemplateCardPropsInterface["name"];
    /**
     * Services for IDP templates.
     */
    services?: TemplateCardPropsInterface["tags"];
    /**
     * Services for IDP templates.
     */
    types?: TemplateCardPropsInterface["tags"];
}


/**
 * Initial display limit.
 * TODO: Generate limit dynamically with screen dimensions.
 * @type {number}
 */
const DEFAULT_PAGINATION_LIMIT = 5;

/**
 * Template grid component.
 *
 * @param {TemplateGridPropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const TemplateGrid = <T extends WithPropertiesInterface>(
    props: TemplateGridPropsInterface<T>
): ReactElement => {

    const {
        emptyPlaceholder,
        heading,
        onTemplateSelect,
        paginate,
        paginationLimit,
        paginationOptions,
        subHeading,
        tagsSectionTitle,
        templates,
        templateIcons,
        type
    } = props;

    const [ templateList, setTemplateList ] = useState<T[]>([]);
    const [ isShowMoreClicked, setIsShowMoreClicked ] = useState<boolean>(false);

    useEffect(() => {
        if (paginate) {
            setTemplateList(_.take(templates, paginationLimit));

            return;
        }

        setTemplateList(templates);
    }, [ templates ]);

    /**
     * Checks if the template image URL is a valid image URL and if not checks if it's
     * available in the passed in icon set.
     *
     * @param image Input image.
     *
     * @return Predefined image if available. If not, return input parameter.
     */
    const resolveTemplateImage = (image: any) => {
        if (typeof image !== "string") {
            return image;
        }

        if ((URLUtils.isHttpsUrl(image) || URLUtils.isHttpUrl(image)) && ImageUtils.isValidImageExtension(image)) {
            return image;
        }

        if (URLUtils.isDataUrl(image)) {
            return image;
        }

        if (!templateIcons) {
            return image;
        }

        const match = Object.keys(templateIcons).find(key => key.toString() === image);

        return match ? templateIcons[ match ] : image;
    };

    /**
     * Handles the view more button action.
     */
    const viewMoreTemplates = (): void => {
        setIsShowMoreClicked(true);
        setTemplateList(templates);
    };

    /**
     * Handles the view less button action.
     */
    const viewLessTemplates = (): void => {
        setIsShowMoreClicked(false);
        setTemplateList(_.take(templates, paginationLimit));
    };

    return (
        <Grid>
            {
                (heading || subHeading)
                    ? (
                        <Grid.Row columns={ 2 }>
                            <Grid.Column>
                                {
                                    heading && (
                                        <Heading as="h4" compact>{ heading }</Heading>
                                    )
                                }
                                {
                                    subHeading && (
                                        <Heading subHeading ellipsis as="h6">{ subHeading }</Heading>
                                    )
                                }
                            </Grid.Column>
                            {
                                paginate && (
                                    <Grid.Column textAlign="right">
                                        {
                                            (templates
                                                && templates instanceof Array
                                                && templates.length >= paginationLimit)
                                                ? (
                                                    isShowMoreClicked ? (
                                                        <LinkButton onClick={ viewLessTemplates }>
                                                            { paginationOptions.showLessButtonLabel }
                                                        </LinkButton>
                                                    ) : (
                                                        <LinkButton onClick={ viewMoreTemplates }>
                                                            { paginationOptions.showMoreButtonLabel }
                                                        </LinkButton>
                                                    )
                                                )
                                                : null
                                        }
                                    </Grid.Column>
                                )
                            }
                        </Grid.Row>
                    )
                    : null
            }
            <Grid.Row>
                <Grid.Column>
                    {
                        (templateList && templateList instanceof Array && templateList.length > 0)
                            ? templateList.map((template, index) => (
                                <TemplateCard
                                    key={ index }
                                    description={ template.description }
                                    image={ resolveTemplateImage(template.image) }
                                    tagsSectionTitle={ tagsSectionTitle }
                                    tags={
                                        type === "application"
                                            ? template.types
                                            : template.services
                                    }
                                    tagsAs={
                                        type === "application"
                                            ? "icon"
                                            : "label"
                                    }
                                    name={ template.name }
                                    id={ template.id }
                                    onClick={ onTemplateSelect }
                                    imageSize="tiny"
                                />
                            ))
                            : emptyPlaceholder && emptyPlaceholder
                    }
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

/**
 * Default props for template grid component.
 */
TemplateGrid.defaultProps = {
    paginate: true,
    paginationLimit: DEFAULT_PAGINATION_LIMIT,
    paginationOptions: {
        showLessButtonLabel: "Show less",
        showMoreButtonLabel: "Show more"
    },
    tagsSectionTitle: "Tags"
};
