import computed from "ember-addons/ember-computed-decorators";
import NavigationDefaultController from 'discourse/controllers/navigation/default';

export default NavigationDefaultController.extend({

  @computed("filterMode", "group")
  navItems(filterMode, group) {
    // we don't want to show the period in the navigation bar since it's in a dropdown
    if (filterMode.indexOf("top/") === 0) { filterMode = filterMode.replace("top/", ""); }
    return Discourse.NavItem.buildGroupList(group, { filterMode });
  }
});