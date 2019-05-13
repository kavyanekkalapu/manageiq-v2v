import { mockStore } from '../../../../../../common/testReduxHelpers';
import { mockRequest, mockReset } from '../../../../../../../../../common/mockRequests';
import { fetchTargetDatastoresAction } from '../MappingWizardDatastoresStepActions';
import {
  targetClusters,
  cloudTenants
} from '../../../../../../../../../redux/common/targetResources/targetResources.fixtures';
import { V2V_TARGET_PROVIDER_STORAGE_KEYS, V2V_TARGET_PROVIDERS } from '../../../MappingWizardConstants';

const store = mockStore({});

afterEach(() => {
  store.clearActions();
  mockReset();
});

describe('fetchTargetDatastoresAction', () => {
  describe('if the target provider is OSP', () => {
    const targetProvider = V2V_TARGET_PROVIDERS[1].id;
    const [targetCloudTenant] = cloudTenants.resources;

    test('dispatches PENDING and FULFILLED actions, adds provider name and does not filter by domain_type', () => {
      mockRequest({
        method: 'GET',
        url: '/api',
        status: 200,
        response: {
          data: {
            ...targetCloudTenant,
            ext_management_system: { name: 'some provider' },
            [V2V_TARGET_PROVIDER_STORAGE_KEYS[targetProvider]]: [
              {
                mock: 'datastore'
              },
              {
                mock: 'datastore2'
              }
            ]
          }
        }
      });

      return store.dispatch(fetchTargetDatastoresAction('/api', '1', targetProvider)).then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      });
    });
  });

  describe('if the target provider is RHV', () => {
    const targetProvider = V2V_TARGET_PROVIDERS[0].id;
    const [targetCluster] = targetClusters.resources;

    test('dispatches PENDING and FULFILLED actions, adds provider name and filters to domain_type of data', () => {
      mockRequest({
        method: 'GET',
        url: '/api',
        status: 200,
        response: {
          data: {
            ...targetCluster,
            ext_management_system: { name: 'some provider' },
            [V2V_TARGET_PROVIDER_STORAGE_KEYS[targetProvider]]: [
              {
                mock: 'datastore',
                storage_domain_type: 'data'
              },
              {
                mock: 'datastore that should NOT be in the snapshot',
                storage_domain_type: 'export'
              }
            ]
          }
        }
      });

      return store.dispatch(fetchTargetDatastoresAction('/api', '1', targetProvider)).then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      });
    });
  });

  test('dispatches PENDING and REJECTED actions', () => {
    mockRequest({
      method: 'GET',
      url: '/api',
      status: 404,
      response: { error: 'error' }
    });

    return store.dispatch(fetchTargetDatastoresAction('/api', '1', 'provider')).catch(() => {
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});
