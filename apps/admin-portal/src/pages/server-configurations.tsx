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

import { AlertInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import React, { FunctionComponent, ReactElement } from "react";
import { useDispatch } from "react-redux";
import { Divider, Grid } from "semantic-ui-react";
import { AccountRecovery, UserSelfRegistration } from "../components";
import { LoginPolicies } from "../components";
import { PasswordPolicies } from "../components";
import { PageLayout } from "../layouts";

/**
 * Governance Features page.
 *
 * @return {React.ReactElement}
 */
export const ServerConfigurationsPage: FunctionComponent<{}> = (): ReactElement => {

	const dispatch = useDispatch();

	/**
	 * Dispatches the alert object to the redux store.
	 * @param {AlertInterface} alert - Alert object.
	 */
	const handleAlerts = (alert: AlertInterface) => {
		dispatch(addAlert(alert));
	};

	return (
		<PageLayout
			title="Server Configurations"
			description="Manage configurations related to the server."
			showBottomDivider={ true }
		>
			<Grid>
				<Grid.Row>
					<Grid.Column width={ 10 }>
						<UserSelfRegistration onAlertFired={ handleAlerts }/>
						<Divider hidden={ true } />
						<AccountRecovery onAlertFired={ handleAlerts }/>
						<Divider hidden={ true } />
						<LoginPolicies onAlertFired={ handleAlerts }/>
						<Divider hidden={ true } />
						<PasswordPolicies onAlertFired={ handleAlerts }/>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</PageLayout>
	);
};
