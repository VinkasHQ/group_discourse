# name: group_discourse
# about: Enable forum feature for user groups
# version: 0.1.0
# authors: Vinoth Kannan (vinothkannan@vinkas.com)
# url: https://github.com/VinkasHQ/group_discourse

enabled_site_setting :group_discourse_enabled

PLUGIN_NAME = "group_discourse".freeze

register_asset "stylesheets/group_discourse.scss"

after_initialize do

  Group.class_eval do

    def primary_category_ids
      CategoryCustomField
        .where(name: "primary_group_id", value: id)
        .pluck(:category_id)
    end

    def primary_categories
      Category.where(id: primary_category_ids)
    end

  end

  BasicGroupSerializer.class_eval do
    attribute :primary_category_ids, key: :categories
  end
end