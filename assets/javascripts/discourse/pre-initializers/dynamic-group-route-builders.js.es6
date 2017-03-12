import buildTopicRoute from 'discourse/plugins/group_discourse/discourse/routes/build-topic-route';
import DiscoverySortableController from 'discourse/controllers/discovery-sortable';

export default {
  after: 'inject-discourse-objects',
  name: 'dynamic-group-route-builders',

  initialize(registry, app) {
    const site = Discourse.Site.current();
    site.get('filters').forEach(filter => {
      const filterCapitalized = filter.capitalize();
      app[`Group${filterCapitalized}Controller`] = DiscoverySortableController.extend();
      app[`Group${filterCapitalized}Route`] = buildTopicRoute(filter);
    });

    Discourse.GroupTopController = DiscoverySortableController.extend();

    Discourse.GroupTopRoute = buildTopicRoute('top');

    site.get('periods').forEach(period => {
      const periodCapitalized = period.capitalize();
      app[`GroupTop${periodCapitalized}Controller`] = DiscoverySortableController.extend();
      app[`GroupTop${periodCapitalized}Route`] = buildTopicRoute('top/' + period);
    });
  }
};
