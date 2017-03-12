export default function() {
  this.route('group', { resetNamespace: true }, function() {
    this.route('top');
    Discourse.Site.currentProp('periods').forEach(period => {
      const top = 'top' + period.capitalize();
      this.route(top, { path: '/top/' + period });
    });
    Discourse.Site.currentProp('filters').forEach(filter => {
      this.route(filter, {path: filter});
    });
  });
}