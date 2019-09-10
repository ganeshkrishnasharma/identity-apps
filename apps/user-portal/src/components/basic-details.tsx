/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
 * under the License
 */

import React, { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, Form, Grid, Icon, List, Popup } from "semantic-ui-react";
import { getProfileInfo, updateProfileInfo } from "../actions";
import { NotificationActionPayload } from "../models/notifications";
import { createEmptyProfile } from "../models/profile";
import { EditSection } from "./edit-section";
import { SettingsSection } from "./settings-section";
import { UserImagePlaceHolder } from "./ui";

/**
 * Proptypes for the basic details component.
 */
interface BasicDetailsProps {
    onNotificationFired: (notification: NotificationActionPayload) => void;
}

/**
 * Basic details component.
 *
 * @param {BasicDetailsProps} props - Props injected to the basic details component.
 * @return {JSX.Element}
 */
export const BasicDetailsComponent: FunctionComponent<BasicDetailsProps> = (
    props: BasicDetailsProps
): JSX.Element => {
    const [profileInfo, setProfileInfo] = useState(createEmptyProfile());
    const [editingProfileInfo, setEditingProfileInfo] = useState(createEmptyProfile());
    const [editingForm, setEditingForm] = useState({
        emailChangeForm: false,
        mobileChangeForm: false,
        nameChangeForm: false,
        organizationChangeForm: false,
    });
    const { onNotificationFired } = props;

    const { t } = useTranslation();

    useEffect(() => {
        if (profileInfo && !profileInfo.username) {
            fetchProfileInfo();
        }
    });

    /**
     * Fetches profile information.
     */
    const fetchProfileInfo = (): void => {
        getProfileInfo()
            .then((response) => {
                if (response.responseStatus === 200) {
                    setBasicDetails(response);
                } else {
                    onNotificationFired({
                        description: t(
                            "views:userProfile.notification.getProfileInfo.error.description"
                        ),
                        message: t(
                            "views:userProfile.notification.getProfileInfo.error.message"
                        ),
                        otherProps: {
                            negative: true
                        },
                        visible: true
                    });
                }
            });
    };

    /**
     * The following method handles the change of state of the input fields.
     * The id of the event target will be used to set the state.
     *
     * @param {ChangeEvent<HTMLInputElement>} e - Input change event
     */
    const handleFieldChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setEditingProfileInfo({
            ...editingProfileInfo,
            [e.target.id]: e.target.value
        });
        event.preventDefault();
    };

    /**
     * The following method handles the `onSubmit` event of forms.
     *
     * @param formName - Name of the form
     */
    const handleSubmit = (formName: string): void => {
        const data = {
            Operations: [
                {
                    op: "replace",
                    value: {}
                }
            ],
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:PatchOp"
            ]
        };

        switch (formName) {
            case "nameChangeForm" : {
                data.Operations[0].value = {
                    name: {
                        familyName: editingProfileInfo.lastName,
                        givenName: editingProfileInfo.displayName
                    }
                };
                break;
            }
            case "emailChangeForm" : {
                data.Operations[0].value = {
                    emails: [editingProfileInfo.email]
                };
                break;
            }
            case "organizationChangeForm" : {
                data.Operations[0].value = {
                    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
                        organization: editingProfileInfo.organisation
                    }
                };
                break;
            }
            case "mobileChangeForm" : {
                data.Operations[0].value = {
                    phoneNumbers: [
                        {
                            type: "mobile",
                            value: editingProfileInfo.mobile
                        }
                    ],
                };
                break;
            }
        }

        updateProfileInfo(data)
            .then((response) => {
                if (response.status === 200) {
                    onNotificationFired({
                        description: t(
                            "views:userProfile.notification.updateProfileInfo.success.description"
                        ),
                        message: t(
                            "views:userProfile.notification.updateProfileInfo.success.message"
                        ),
                        otherProps: {
                            positive: true
                        },
                        visible: true
                    });

                    // Re-fetch the profile information
                    fetchProfileInfo();
                }
            });

        // Hide corresponding edit view
        hideFormEditView(formName);
    };

    /**
     * The following method handles the onClick event of the edit button.
     *
     * @param formName - Name of the form
     */
    const showFormEditView = (formName: string): void => {
        setEditingForm({
            ...editingForm,
            [formName]: true
        });
    };

    /**
     * The following method handles the onClick event of the cancel button.
     *
     * @param formName - Name of the form
     */
    const hideFormEditView = (formName: string): void => {
        setEditingForm({
            ...editingForm,
            [formName]: false
        });
    };

    /**
     * Set the fetched basic profile details to the state.
     *
     * @param profile - Response from the API request.
     */
    const setBasicDetails = (profile) => {
        let mobileNumber = "";
        profile.phoneNumbers.map((mobile) => {
            mobileNumber = mobile.value;
        });
        setEditingProfileInfo({
            ...editingProfileInfo,
            displayName: profile.displayName,
            email: profile.emails[0],
            emails: profile.emails,
            lastName: profile.lastName,
            mobile: mobileNumber,
            organisation: profile.organisation,
            phoneNumbers: profile.phoneNumbers,
            username: profile.username,
        });
        setProfileInfo({
            ...profileInfo,
            displayName: profile.displayName,
            email: profile.emails[0],
            emails: profile.emails,
            lastName: profile.lastName,
            mobile: mobileNumber,
            organisation: profile.organisation,
            phoneNumbers: profile.phoneNumbers,
            username: profile.username,
        });
    };

    const handleNameChange = (
        editingForm.nameChangeForm
            ? (
                <EditSection>
                    <Grid>
                        <Grid.Row columns={ 2 }>
                            <Grid.Column width={ 4 }>
                                { t("views:userProfile.fields.name.label") }
                            </Grid.Column>
                            <Grid.Column width={ 12 }>
                                <Form onSubmit={ () => handleSubmit("nameChangeForm") }>
                                    <Form.Field>
                                        <label>
                                            { t("views:userProfile.forms.nameChangeForm.inputs.firstName.label") }
                                        </label>
                                        <input
                                            required
                                            id="displayName"
                                            placeholder={ t("views:userProfile.forms.nameChangeForm.inputs" +
                                                ".firstName.placeholder") }
                                            value={ editingProfileInfo.displayName }
                                            onChange={ handleFieldChange }/>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>
                                            { t("views:userProfile.forms.nameChangeForm.inputs.lastName.label") }
                                        </label>
                                        <input
                                            required
                                            id="lastName"
                                            placeholder={ t("views:userProfile.forms.nameChangeForm.inputs" +
                                                ".lastName.placeholder") }
                                            value={ editingProfileInfo.lastName }
                                            onChange={ handleFieldChange }/>
                                    </Form.Field>
                                    <Divider hidden/>
                                    <Button type="submit" primary>
                                        { t("common:save") }
                                    </Button>
                                    <Button
                                        className="link-button"
                                        onClick={ () => hideFormEditView("nameChangeForm") }
                                    >
                                        { t("common:cancel") }
                                    </Button>
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </EditSection>
            )
            :
            (
                <Grid padded>
                    <Grid.Row columns={ 3 }>
                        <Grid.Column width={ 4 } className="first-column">
                            <List.Content>
                                { t("views:userProfile.fields.name.label") }
                            </List.Content>
                        </Grid.Column>
                        <Grid.Column width={ 10 }>
                            <List.Content>
                                <List.Description>
                                    { profileInfo.displayName + " " + profileInfo.lastName }
                                </List.Description>
                            </List.Content>
                        </Grid.Column>
                        <Grid.Column width={ 2 } className="last-column">
                            <List.Content floated="right">
                                <Popup
                                    trigger={
                                        <Icon
                                            link
                                            className="list-icon"
                                            size="small"
                                            color="grey"
                                            onClick={ () => showFormEditView("nameChangeForm") }
                                            name="pencil alternate"
                                        />
                                    }
                                    position="top center"
                                    content="Edit"
                                    inverted
                                />
                            </List.Content>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            ));

    const handleEmailChange = (
        editingForm.emailChangeForm
            ? (
                <EditSection>
                    <Grid>
                        <Grid.Row columns={ 2 }>
                            <Grid.Column width={ 4 }>
                                { t("views:userProfile.fields.email.label") }
                            </Grid.Column>
                            <Grid.Column width={ 12 }>
                                <Form onSubmit={ () => handleSubmit("emailChangeForm") }>
                                    <Form.Field>
                                        <label>{ t("views:userProfile.fields.email.label") }</label>
                                        <input
                                            required
                                            id="email"
                                            placeholder={ t("views:userProfile.forms.emailChangeForm.inputs" +
                                                ".email.placeholder") }
                                            value={ editingProfileInfo.email }
                                            onChange={ handleFieldChange }
                                        />
                                    </Form.Field>
                                    <Divider hidden/>
                                    <Button type="submit" primary>
                                        { t("common:save") }
                                    </Button>
                                    <Button
                                        className="link-button"
                                        onClick={ () => hideFormEditView("emailChangeForm") }
                                    >
                                        { t("common:cancel") }
                                    </Button>
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </EditSection>
            )
            :
            (
                <Grid padded>
                    <Grid.Row columns={ 3 }>
                        <Grid.Column width={ 4 } className="first-column">
                            <List.Content>
                                { t("views:userProfile.fields.email.label") }
                            </List.Content>
                        </Grid.Column>
                        <Grid.Column width={ 10 }>
                            <List.Content>
                                <List.Description>
                                    {
                                        profileInfo.email
                                            ? profileInfo.email
                                            : t("views:userProfile.fields.email.default")
                                    }
                                </List.Description>
                            </List.Content>
                        </Grid.Column>
                        <Grid.Column width={ 2 } className="last-column">
                            <List.Content floated="right">
                                <Popup
                                    trigger={
                                        <Icon
                                            link
                                            className="list-icon"
                                            size="small"
                                            color="grey"
                                            id="emailEdit"
                                            onClick={ () => showFormEditView("emailChangeForm") }
                                            name={ profileInfo.email ? "pencil alternate" : "add" }
                                        />
                                    }
                                    position="top center"
                                    content={ profileInfo.email ? t("common:edit") : t("common:add") }
                                    inverted
                                />
                            </List.Content>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            ));

    const handleOrganisationChange = (
        editingForm.organizationChangeForm
            ? (
                <EditSection>
                    <Grid>
                        <Grid.Row columns={ 2 }>
                            <Grid.Column width={ 4 }>
                                { t("views:userProfile.fields.organization.label") }
                            </Grid.Column>
                            <Grid.Column width={ 12 }>
                                <Form onSubmit={ () => handleSubmit("organizationChangeForm") }>
                                    <Form.Field>
                                        <label>{ t("views:userProfile.fields.organization.label") }</label>
                                        <input
                                            required
                                            id="organisation"
                                            placeholder={ t("views:userProfile.forms.organizationChangeForm" +
                                                ".inputs.organization.placeholder") }
                                            value={ editingProfileInfo.organisation }
                                            onChange={ handleFieldChange }
                                        />
                                    </Form.Field>
                                    <Divider hidden/>
                                    <Button type="submit" primary>
                                        { t("common:save") }
                                    </Button>
                                    <Button
                                        className="link-button"
                                        onClick={ () => hideFormEditView("organizationChangeForm") }
                                    >
                                        { t("common:cancel") }
                                    </Button>
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </EditSection>
            )
            :
            (
                <Grid padded>
                    <Grid.Row columns={ 3 }>
                        <Grid.Column width={ 4 } className="first-column">
                            <List.Content>
                                { t("views:userProfile.fields.organization.label") }
                            </List.Content>
                        </Grid.Column>
                        <Grid.Column width={ 10 }>
                            <List.Content>
                                <List.Description>
                                    {
                                        profileInfo.organisation
                                            ? profileInfo.organisation
                                            : t("views:userProfile.fields.organization.default")
                                    }
                                </List.Description>
                            </List.Content>
                        </Grid.Column>
                        <Grid.Column width={ 2 } className="last-column">
                            <List.Content floated="right">
                                <Popup
                                    trigger={
                                        <Icon
                                            link
                                            className="list-icon"
                                            size="small"
                                            color="grey"
                                            id="organizationEdit"
                                            onClick={ () => showFormEditView("organizationChangeForm") }
                                            name={ profileInfo.organisation ? "pencil alternate" : "add" }
                                        />
                                    }
                                    position="top center"
                                    content={ profileInfo.organisation ? t("common:edit") : t("common:add") }
                                    inverted
                                />
                            </List.Content>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )
    );

    const handleMobileChange = (
        editingForm.mobileChangeForm
            ? (
                <EditSection>
                    <Grid>
                        <Grid.Row columns={ 2 }>
                            <Grid.Column width={ 4 }>
                                { t("views:userProfile.fields.mobile.label") }
                            </Grid.Column>
                            <Grid.Column width={ 12 }>
                                <Form onSubmit={ () => handleSubmit("mobileChangeForm") }>
                                    <Form.Field>
                                        <label>{ t("views:userProfile.fields.mobile.label") }</label>
                                        <input
                                            required
                                            id="mobile"
                                            placeholder={ t("views:userProfile.forms.mobileChangeForm" +
                                                ".inputs.mobile.placeholder") }
                                            value={ editingProfileInfo.mobile }
                                            onChange={ handleFieldChange }
                                        />
                                    </Form.Field>
                                    <Divider hidden/>
                                    <Button type="submit" primary>
                                        { t("common:save") }
                                    </Button>
                                    <Button
                                        className="link-button"
                                        onClick={ () => hideFormEditView("mobileChangeForm") }
                                    >
                                        { t("common:cancel") }
                                    </Button>
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </EditSection>
            )
            :
            (
                <Grid padded>
                    <Grid.Row columns={ 3 }>
                        <Grid.Column width={ 4 } className="first-column">
                            <List.Content>
                                { t("views:userProfile.fields.mobile.label") }
                            </List.Content>
                        </Grid.Column>
                        <Grid.Column width={ 10 }>
                            <List.Content>
                                <List.Description>
                                    {
                                        profileInfo.mobile
                                            ? profileInfo.mobile
                                            : t("views:userProfile.fields.mobile.default")
                                    }
                                </List.Description>
                            </List.Content>
                        </Grid.Column>
                        <Grid.Column width={ 2 } className="last-column">
                            <List.Content floated="right">
                                <Popup
                                    trigger={
                                        <Icon
                                            link
                                            className="list-icon"
                                            size="small"
                                            color="grey"
                                            onClick={ () => showFormEditView("mobileChangeForm") }
                                            name={ profileInfo.mobile ? "pencil alternate" : "add" }
                                        />
                                    }
                                    position="top center"
                                    content={ profileInfo.mobile ? t("common:edit") : t("common:add") }
                                    inverted
                                />
                            </List.Content>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )
    );

    return (
        <SettingsSection
            contentPadding={ false }
            header={ t("views:userProfile.title") }
            description={ t("views:userProfile.subTitle") }
            icon={ <UserImagePlaceHolder size="tiny"/> }
            iconSize="auto"
            iconStyle="colored"
            iconFloated="right"
        >
            <List divided verticalAlign="middle" className="main-content-inner">
                <List.Item className="inner-list-item">
                    <Grid padded>
                        <Grid.Row columns={ 3 }>
                            <Grid.Column width={ 4 } className="first-column">
                                <List.Content>
                                    { t("views:userProfile.fields.username.label") }
                                </List.Content>
                            </Grid.Column>
                            <Grid.Column width={ 10 }>
                                <List.Content>
                                    <List.Description>{ profileInfo.username }</List.Description>
                                </List.Content>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </List.Item>
                <List.Item className="inner-list-item">
                    { handleNameChange }
                </List.Item>
                <List.Item className="inner-list-item">
                    { handleEmailChange }
                </List.Item>
                <List.Item className="inner-list-item">
                    { handleOrganisationChange }
                </List.Item>
                <List.Item className="inner-list-item">
                    { handleMobileChange }
                </List.Item>
            </List>
        </SettingsSection>
    );
};