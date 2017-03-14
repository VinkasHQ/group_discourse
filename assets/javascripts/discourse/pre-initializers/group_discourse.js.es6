import { default as computed, observes } from 'ember-addons/ember-computed-decorators';
import Category from 'discourse/models/category';
import NavItem from 'discourse/models/nav-item';
import GroupController from 'discourse/controllers/group';
import GroupIndexRoute from 'discourse/routes/group-index';
import GroupMembersRoute from 'discourse/routes/group-members';

export default {
  name: 'group_discourse',
  before: 'inject-discourse-objects',
  initialize() {

    Category.reopen({

      @computed('custom_fields.primary_group_id')
      primary_group_id: {
        get() {
          return this.get("custom_fields.primary_group_id");
        },
        set(value) {
          this.set("custom_fields.primary_group_id", value);
        }
      }

    });

    var Tab = Em.Object.extend({
      @computed('name')
      location(name) {
        return 'group.' + name;
      },

      @computed('name', 'i18nKey')
      message(name, i18nKey) {
        return I18n.t(`groups.${i18nKey || name}`);
      }
    });

    GroupController.reopen({
      showing: 'latest',
      navigationGroup: Ember.inject.controller('navigation-group'),

      group: Em.computed.alias('navigationGroup.group'),
      tabs: [
        Tab.create({ name: 'members' }),
        Tab.create({ name: 'activity' }),
        Tab.create({
          name: 'edit', i18nKey: 'edit.title', icon: 'pencil', requiresGroupAdmin: true
        }),
        Tab.create({
          name: 'logs', i18nKey: 'logs.title', icon: 'list-alt', requiresGroupAdmin: true
        })
      ],
    });

    GroupIndexRoute.reopen({
      beforeModel: function() {
        this.transitionTo("group.latest");
      }
    });

    GroupMembersRoute.reopen({

      renderTemplate() {
        this.render('group-index');
      },

      titleToken() {
        return I18n.t('groups.members');
      },

      model() {
        return this.modelFor("group");
      },

      beforeModel: function() {

      },

      setupController(controller, model) {
        this.controllerFor("group").set("showing", "members");
        controller.set("model", model);
        model.findMembers();
      }

    });

    NavItem.reopen({

      filterMode: function() {
        var name = this.get('name');

        if( name.split('/')[0] === 'category' ) {
          return 'c/' + this.get('categorySlug');
        } else {
          var mode = "",
          category = this.get("category"),
          group = this.get("group");

          if(category){
            mode += "c/";
            mode += Discourse.Category.slugFor(this.get('category'));
            if (this.get('noSubcategories')) { mode += '/none'; }
            mode += "/l/";
          }

          if(group){
            mode += "groups/";
            mode += group.name;
            mode += "/";
          }
          return mode + name.replace(' ', '-');
        }
      }.property('name')

    });

    NavItem.reopenClass({
      // create a nav item from the text, will return null if there is not valid nav item for this particular text
      fromText(text, opts) {
        var split = text.split(","),
            name = split[0],
            testName = name.split("/")[0],
            anonymous = !Discourse.User.current();

        if (anonymous && !Discourse.Site.currentProp('anonymous_top_menu_items').includes(testName)) return null;
        if (!Discourse.Category.list() && testName === "categories") return null;
        //if (!Discourse.Site.currentProp('group_menu_items').includes(testName)) return null;

        var args = { name: name, hasIcon: name === "unread" }, extra = null, self = this;
        if (opts.category) { args.category = opts.category; }
        if (opts.group) { args.group = opts.group; }
        if (opts.noSubcategories) { args.noSubcategories = true; }
        _.each(NavItem.extraArgsCallbacks, function(cb) {
          extra = cb.call(self, text, opts);
          _.merge(args, extra);
        });

        const store = Discourse.__container__.lookup('store:main');
        return store.createRecord('nav-item', args);
      },

      buildGroupList(group, args) {
        args = args || {};

        if (group) { args.group = group; }

        let items = Discourse.SiteSettings.group_menu.split("|");

        if (args.filterMode && !_.some(items, i => i.indexOf(args.filterMode) !== -1)) {
          items.push(args.filterMode);
        }

        return items.map(i => Discourse.NavItem.fromText(i, args))
                    .filter(i => i !== null && !(group && i.get("name").indexOf("grou") === 0));
      }

    });

  }
};