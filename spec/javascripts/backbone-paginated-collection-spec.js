describe("Backbone.PaginatedCollection", function() {
  var TehModel = Backbone.Model.extend({
    defaults: {value: -1}
  });

  var RegularModelCollection = Backbone.Collection.extend({
    model: TehModel
  });

  var ModelCollection = Backbone.PaginatedCollection.extend({
    model: TehModel
  });

  var allModels;
  var collection;

  var modelRemoved;
  var removedIndex;
  var modelAdded;
  var addedIndex;
  var paginatedCount;

  beforeEach(function() {
    allModels = new RegularModelCollection();
    for(var i = 0; i < 10; i++) {
      allModels.add(new TehModel({value: i}));
    }

    collection = new ModelCollection(null, {collection: allModels, perPage: 2});
  });

  beforeEach(function() {
    modelRemoved = null;
    removedIndex = null;
    modelAdded = null;
    addedIndex = null;
    paginatedCount = 0;

    collection.bind("remove", function(model, collection, options) {
      modelRemoved = model;
      removedIndex = options.index;
    });
    collection.bind("add", function(model, collection, options) {
      modelAdded = model;
      addedIndex = options.index;
    });
    collection.bind("paginated", function() {
      paginatedCount += 1;

    });
  });

  describe("#totalPages", function() {
    it("should break up the number of pages", function() {
      collection.perPage = 2;
      expect(collection.totalPages()).toEqual(5);
    });
    it("should break up the number of pages, including partial pages", function() {
      collection.perPage = 3;
      expect(collection.totalPages()).toEqual(4);
    });
  });

  describe("#changePage", function() {
    it("should set the current page to the given page number, and only contain models in that page", function() {
      collection.changePage(0);
      expect(collection.length).toEqual(2);
      expect(collection.at(0).get('value')).toEqual(0);
      expect(collection.at(1).get('value')).toEqual(1);

      collection.changePage(1);
      expect(collection.length).toEqual(2);
      expect(collection.at(0).get('value')).toEqual(2);
      expect(collection.at(1).get('value')).toEqual(3);
    });

    it("should create an event that the page has changed", function() {
      var triggered = 0;
      var expectedPage;
      collection.bind("paginated", function(page, obj) {
        triggered += 1;
        expect(page).toEqual(expectedPage);
        expect(obj).toEqual(collection);
      });
      expectedPage = 0;
      collection.changePage(0);

      expectedPage = 3;
      collection.changePage(3);

      expect(triggered).toEqual(2);
    });

    it("should not trigger a reset event", function() {
      var triggered = 0;
      collection.bind("reset", function() {
        triggered += 1;
      });
      collection.changePage(1);
      collection.changePage(2);
      expect(triggered).toEqual(0);
    });
  });

  describe("event:add", function() {
    it("shifts the collection right if element added before current page", function() {
      collection.changePage(1)
      toBeAdded = allModels.models[1];
      toBeRemoved = allModels.models[3];
      allModels.add(new TehModel({value: 11}), {at: 0})

      expect(addedIndex).toEqual(0);
      expect(removedIndex).toEqual(1);
      expect(modelAdded).toEqual(toBeAdded);
      expect(modelRemoved).toEqual(toBeRemoved);
    });

    it("does nothing if element added after current page", function() {
      collection.changePage(1);
      allModels.add(new TehModel({value: 11}), {at: 9});

      expect(modelAdded).toEqual(null);
      expect(addedIndex).toEqual(null);
      expect(modelRemoved).toEqual(null);
      expect(removedIndex).toEqual(null);
    });

    it("inserts the new element, shifts everything right if added on current page", function() {
      collection.changePage(1)
      toBeAdded = new TehModel({value: 11});
      toBeRemoved = allModels.models[3];
      allModels.add(toBeAdded, {at: 2})

      expect(addedIndex).toEqual(0);
      expect(removedIndex).toEqual(1);
      expect(modelAdded).toEqual(toBeAdded);
      expect(modelRemoved).toEqual(toBeRemoved);
    });

    it("inserts the new element, removes last element if added at end of current page", function() {
      collection.changePage(1)
      toBeAdded = new TehModel({value: 11});
      toBeRemoved = allModels.models[3];
      allModels.add(toBeAdded, {at: 3})

      expect(addedIndex).toEqual(1);
      expect(removedIndex).toEqual(1);
      expect(modelAdded).toEqual(toBeAdded);
      expect(modelRemoved).toEqual(toBeRemoved);
    });

    it("should just add when added to the last page", function() {
      allModels.add(toBeAdded, {at: 3})
      collection.changePage(5)

      addedIndex = null
      removedIndex = null
      modelAdded = null
      modelRemoved = null

      toBeAdded = new TehModel({value: 11});
      allModels.add(toBeAdded)

      expect(modelAdded).toEqual(toBeAdded)
      expect(modelRemoved).toEqual(null)
    });
  });

  describe("event:remove", function() {
    it("does nothing if element added after current page", function() {
      collection.changePage(0);
      allModels.remove(allModels.models[9]); // last model

      expect(modelRemoved).toBeFalsy();
      expect(modelAdded).toBeFalsy();
      expect(removedIndex).toEqual(null);
      expect(addedIndex).toEqual(null);
    });

    it("removes removed element, and adds one from next page", function() {
      collection.changePage(0);
      var toRemove = allModels.models[0];
      var toAdd = allModels.models[2];

      allModels.remove(toRemove); // last model

      expect(modelRemoved).toEqual(toRemove);
      expect(modelAdded).toEqual(toAdd);
      expect(removedIndex).toEqual(0);
      expect(addedIndex).toEqual(1);
    });

    it("shifts the collection left if element removed before current page", function() {
      collection.changePage(1);
      var toRemove = allModels.models[2];
      var toAdd = allModels.models[4];

      allModels.remove(allModels.models[0]); // last model

      expect(modelRemoved).toEqual(toRemove);
      expect(modelAdded).toEqual(toAdd);
      expect(removedIndex).toEqual(0);
      expect(addedIndex).toEqual(1);
    });

    it("paginates one back back if last element on last page removed", function() {
      allModels.add(new TehModel({value: 11}))
      collection.changePage(5);
      expect(collection.length).toEqual(1);

      paginatedCount = 0;
      allModels.remove(allModels.models[10]); // last model

      expect(modelRemoved).toBeFalsy();
      expect(removedIndex).toEqual(null);
      expect(modelAdded).toBeFalsy();
      expect(addedIndex).toEqual(null);

      expect(paginatedCount).toEqual(1);
    });

    it("removes element on last page, does not paginate if one model on last page removed", function() {
      collection.changePage(4);
      expect(collection.length).toEqual(2);

      toRemove = allModels.models[8];
      allModels.remove(toRemove); // last model

      expect(modelRemoved).toEqual(toRemove);
      expect(removedIndex).toEqual(0);
      expect(modelAdded).toBeFalsy();
      expect(addedIndex).toEqual(null);
    });

    it("is ok when multiple elements are removed", function() {
      collection.changePage(0);
      allModels.remove(allModels.models[0]);
      allModels.remove(allModels.models[0]);
      allModels.remove(allModels.models[0]);
      allModels.remove(allModels.models[0]);
      allModels.remove(allModels.models[0]);
      allModels.remove(allModels.models[0]);

      expect(collection.models[0]).toEqual(allModels.models[0])
    });
  });

  describe("#lastPage", function() {
    it("should return the page index of the last page", function() {
      expect(collection.lastPage()).toEqual(collection.totalPages() - 1);
    });
  });

  describe("#isLastPage", function() {
    it("should return true if on the last page", function() {
      expect(collection.isLastPage()).toBeFalsy();

      collection.page = collection.totalPages() - 1;

      expect(collection.isLastPage()).toBeTruthy();
    });
  });

  describe("#modelToRemove", function() {
    it("should return the given model if that model is on the current page", function() {
      expect(collection.modelToRemove(collection.models[0], 0)).toEqual(collection.models[0])
    });

    it("should return null if the collection is on page 0 and the model not in the current view", function() {
      expect(collection.modelToRemove(allModels.models[9], 9)).toBeNull();
    });

    it("should return the first element of the collection if the model is on a previous page", function() {
      collection.changePage(2);
      expect(collection.modelToRemove(allModels.models[0], 0)).toEqual(collection.models[0]);
    });

    it("should return null if the element is on the following page", function() {
      collection.changePage(2);
      expect(collection.modelToRemove(allModels.models[9], 9)).toBeNull();
    });
  });

  describe("#paginatedOffset", function() {
    it("returns a number > this.perPage if the index is in a proceeding page", function() {
      collection.changePage(2);

      expect(collection.paginatedOffset(6)).toEqual(2);
    });

    it("returns a negative number if in a previous page", function() {
      collection.changePage(2);

      expect(collection.paginatedOffset(0)).toEqual(-4);
    });

    it("return a positive number < this.perPage if in current page", function() {
      collection.changePage(2);

      expect(collection.paginatedOffset(4)).toEqual(0);
    });
  });

  describe("events", function() {
    it("should trigger a reset event when the underlying model changed", function() {
      var triggered = 0;
      collection.bind("reset", function() {
        triggered += 1;
      });
      allModels.reset([new TehModel({value: 1})]);
      expect(triggered).toEqual(1);
    });

    it("should trigger a reset event when the underlying model has been sorted", function() {
      var triggered = 0;
      collection.bind("reset", function() {
        triggered += 1;
      });
      allModels.comparator = function(model) { return model.get("value"); };
      allModels.sort();

      expect(triggered).toEqual(1);
    });

    it("should trigger a filter-complete event when underlying model triggers it", function() {
      var triggered = 0;
      collection.bind("filter-complete", function() {
        triggered += 1;
      });
      allModels.trigger("filter-complete");

      expect(triggered).toEqual(1);
    });
  });
});
