(function(Backbone) {
  /**
   * This is a paginated collection. You give it an original collection
   * and tell it which page to render via #changePage or the page attribute
   * during initialization.
   *
   * The perPage controls how many items exist on a single page. Be
   * careful as a reset is needed afterwards.
   *
   * calling #changePage with no args will effectively reset pagination
   *
   * do not modify this collection directly via #add/#remove, modify the
   * underlying origModel.
   */
  Backbone.PaginatedCollection = Backbone.Collection.extend({
    page: -1,
    perPage: 3,
    origModel: null,
    model: null,

    initialize: function(data) {
      this.origModel = data.origModel;
      this.perPage = data.perPage || this.perPage;

      var origModel = this.origModel;
      origModel.bind("add", this.resetOrigModel, this);
      origModel.bind("remove", this.resetOrigModel, this);
      origModel.bind("reset", this.resetOrigModel, this);
      this.changePage(data.page);
    },

    totalPages: function() {
      return Math.ceil(this.origModel.length / (this.perPage * 1.0));
    },

    resetOrigModel: function() {
      this.changePage();
    },

    changePage: function(pageNumber) {
      this.page = pageNumber || 0;
      var offset = this.page * this.perPage;
      var end = offset + this.perPage;

      var slice = this.origModel.models.slice(offset, end);
      this.reset(slice);
    }
  });
})(Backbone);