/*
Copyright (C) 2012 Dmitriy Likhten

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
   * this will trigger a "paginated" event passing in the page # changed
   * to as well as self. function(pageNumber, paginatedCollection)
   *
   * When paginating, the reset event is not triggered. When the underlying
   * data model is reset, the reset event is triggered.
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
      return Math.ceil(this.origModel.length / this.perPage);
    },

    resetOrigModel: function() {
      this.changePage();
      this.trigger("reset", this);
    },

    changePage: function(pageNumber) {
      this.page = pageNumber || 0;
      var offset = this.page * this.perPage;
      var end = offset + this.perPage;

      var slice = this.origModel.models.slice(offset, end);
      this.reset(slice, {silent: true});
      this.trigger("paginated", this.page, this);
    }
  });
})(Backbone);