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

import { IdentityProviderActionTypes, SetAvailableAuthenticatorsMetaInterface } from "./types/identity-provider";
import { FederatedAuthenticatorListItemInterface } from "../../models";

/**
 * Redux action to set the list of available authenticators.
 *
 * @param {FederatedAuthenticatorMetaInterface} meta - Inbound auth protocol meta.
 * @return {SetAvailableAuthenticatorsMetaInterface} An action of type `SET_AVAILABLE_AUTHENTICATOR_META`
 */
export const setAvailableAuthenticatorsMeta = (
    meta: FederatedAuthenticatorListItemInterface[]
): SetAvailableAuthenticatorsMetaInterface => ({
    payload: meta,
    type: IdentityProviderActionTypes.SET_AVAILABLE_AUTHENTICATOR_META
});
