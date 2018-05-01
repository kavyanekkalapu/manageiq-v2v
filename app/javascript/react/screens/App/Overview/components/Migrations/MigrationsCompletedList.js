import React from 'react';
import PropTypes from 'prop-types';
import { noop, Button, ListView, Grid, Spinner } from 'patternfly-react';
import { IsoElpasedTime } from '../../../../../../components/dates/IsoElapsedTime';
import OverviewEmptyState from '../OverviewEmptyState/OverviewEmptyState';

const MigrationsCompletedList = ({
  finishedTransformationPlans,
  retryClick,
  loading,
  redirectTo
}) => (
  <Grid.Col xs={12}>
    <Spinner loading={loading}>
      {finishedTransformationPlans.length > 0 ? (
        <ListView className="plans-complete-list" style={{ marginTop: 0 }}>
          {finishedTransformationPlans.map(plan => {
            const [mostRecentRequest] = plan.miq_requests.slice(-1);
            const failed = mostRecentRequest.status === 'failed';

            const tasks = {};
            plan.miq_requests.forEach(request => {
              request.miq_request_tasks.forEach(task => {
                tasks[task.source_id] = task.status === 'Ok';
              });
            });

            let succeedCount = 0;
            Object.values(tasks).forEach(value => {
              if (value) succeedCount += 1;
            });

            const elapsedTime = IsoElpasedTime(
              new Date(mostRecentRequest.created_on),
              new Date(mostRecentRequest.options.delivered_on)
            );

            return (
              <ListView.Item
                className="plans-complete-list__list-item"
                onClick={() => {
                  redirectTo(`/migration/plan/${plan.id}`);
                }}
                key={plan.id}
                leftContent={
                  <ListView.Icon
                    type="pf"
                    name={failed ? 'error-circle-o' : 'ok'}
                    size="md"
                    style={{ width: 'inherit', backgroundColor: 'transparent' }}
                  />
                }
                heading={plan.name}
                additionalInfo={[
                  <ListView.InfoItem
                    key={`${plan.id}-migrated`}
                    style={{ paddingRight: 40 }}
                  >
                    <ListView.Icon type="pf" size="lg" name="screen" />&nbsp;<strong
                    >
                      {succeedCount}
                    </strong>{' '}
                    {__('of')} &nbsp;<strong>
                      {Object.keys(tasks).length}{' '}
                    </strong>
                    {__('VMs successfully migrated.')}
                  </ListView.InfoItem>,
                  <ListView.InfoItem key={`${plan.id}-elapsed`}>
                    <ListView.Icon type="fa" size="lg" name="clock-o" />
                    {elapsedTime}
                  </ListView.InfoItem>
                ]}
                actions={
                  (failed && (
                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        retryClick(plan.href);
                      }}
                      disabled={loading === plan.href}
                    >
                      Retry
                    </Button>
                  )) ||
                  (!failed && <div style={{ width: 50 }} />)
                }
              />
            );
          })}
        </ListView>
      ) : (
        <OverviewEmptyState
          title={__('No Migration Plans Completed')}
          iconType="pf"
          iconName="info"
          description={
            <div>
              {__(
                'There are no existing migration plans in a Completed state.'
              )}
              <br />{' '}
              {__(
                'Make a selection in the dropdown to view plans in other states.'
              )}
            </div>
          }
        />
      )}
    </Spinner>
  </Grid.Col>
);

MigrationsCompletedList.propTypes = {
  finishedTransformationPlans: PropTypes.array,
  retryClick: PropTypes.func,
  loading: PropTypes.string,
  redirectTo: PropTypes.func
};
MigrationsCompletedList.defaultProps = {
  finishedTransformationPlans: [],
  retryClick: noop,
  loading: ''
};

export default MigrationsCompletedList;