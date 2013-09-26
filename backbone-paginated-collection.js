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
*
* Version 0.0.2
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
   * underlying collection.
   */
  Backbone.PaginatedCollection = Backbone.Collection.extend({
    perPage: 3
    ,page: 0

    ,initialize: function(models, data) {
      if (models) throw "models cannot be set directly, unfortunately first argument is the models.";
      this.collection = data.collection;
      this.perPage = data.perPage || this.perPage;
      var collection = this.collection;
      collection.on("add", this._add, this);
      collection.on("remove", this._remove, this);
      collection.on("reset", this.reset, this);
      collection.on("sort", this.reset, this);

      // filter-complete needs to be propagated, its important for this to happen
      collection.on("filter-complete", function() { this.trigger("filter-complete", this); }, this);
      this.changePage();
    }

    ,_add: function(model, collection, options) {
      var where = this.collection.indexOf(model);
      var paginatedOffset = this.paginatedOffset(where);

      if (paginatedOffset < this.perPage) {
        if(this.lastPage() !== this.page) {
          // always remove the last element, that's always shifted over
          var removeIndex = this.models.length - 1;
          var toRemove = this.models[removeIndex];
          this.remove(toRemove);
          this.triggerRemove(toRemove, removeIndex, options);
        }

        var toAdd;
        var toAddIndex;
        if (paginatedOffset >= 0) {
          toAdd = model;
          toAddIndex = paginatedOffset;
        }
        else {
          // we need an extra 1 index (no -1 in calculation) because the previous element shifted by 1
          toAdd = this.collection.models[this.offset()];
          toAddIndex = 0;
        }
        this.add(toAdd, {at: toAddIndex});
        this.triggerAdd(toAdd, toAddIndex, options);
      }
    }

    // when a model is removed from the underlying collection one of three things will be true
    ,_remove: function(model, collection, options) {
      var toRemove = this.modelToRemove(model, options.index);

      // if toRemove is null, then the model removed comes after
      // the current page, thus this page is not affected
      if (toRemove) {
        var removalIndex = this.indexOf(toRemove);
        Backbone.Collection.prototype.remove.call(this, toRemove);

        // total pages changed because it calculates based on
        // the underlying model. So we compare if the current page
        // is above the total pages (1 offset
        if (this.page === this.lastPage() + 1) {
          this.changePage(this.lastPage());
        }
        else if (this.isLastPage()) {
          this.triggerRemove(toRemove, removalIndex, options);
        }
        else {
          this.triggerRemove(toRemove, removalIndex, options);

          // we're somewhere not on the last page, therefore we must trigger an
          // add event for the one model that got shifted over, which is actually the
          // last model in this page, so just sync and trigger that
          // add event if appropriate
          this.syncPage();

          var addIndex = this.models.length - 1;
          this.triggerAdd(this.models[addIndex], addIndex, options);
        }
      }
    }

    ,triggerRemove: function(toRemove, index, origOptions) {
      if (! origOptions || ! origOptions.silent) {
        this.trigger("remove", toRemove, this, {index: index});
      }
    }
    ,triggerAdd: function(toAdd, index, origOptions) {
      if (! origOptions || ! origOptions.silent) {
        this.trigger("add", toAdd, this, {index: index})
      }
    }

    ,offset: function() {
      return this.page * this.perPage;
    }

    ,modelToRemove: function(desiredModel, index) {
      if (this.isRemovalOnCurrentPage(desiredModel)) {
        return desiredModel;
      }
      else if (index <= this.offset()) {
        return this.models[0];
      }
      else {
        return null;
      }
    }

    ,paginatedOffset: function(index) {
      return index - this.offset();
    }

    ,isRemovalOnCurrentPage: function(model) {
      return this.indexOf(model) !== -1;
    }

    ,reset: function() {
      this.changePage();
      this.trigger("reset", this);
    }

    ,totalPages: function() {
      return Math.ceil(this.collection.length / this.perPage) || 1;
    }

    ,lastPage: function() {
      return this.totalPages() - 1;
    }

    ,isLastPage: function() {
      return this.page === this.lastPage();
    }

    ,syncPage: function() {
      var offset = this.offset();
      var end = offset + this.perPage;

      var slice = this.collection.models.slice(offset, end);
      Backbone.Collection.prototype.reset.call(this, slice, {silent: true});
    }

    ,changePage: function(pageNumber) {
      this.page = pageNumber || 0;
      if (this.page < 0) this.page = 0;
      var lastPage = this.lastPage();
      if (this.page > lastPage) this.page = lastPage;

      this.syncPage();
      this.trigger("paginated", this.page, this);
    }

    ,_onModelEvent: function() {
      // noop. This collection does not directly handle elements, rather it
      // delegates all that work to the underlying collection
    }
  });
})(Backbone);

