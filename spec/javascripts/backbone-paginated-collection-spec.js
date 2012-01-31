describe("Backbone.PaginatedCollection", function() {
  var TehModel = Backbone.RelationalModel.extend({
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

  beforeEach(function() {
    allModels = new RegularModelCollection();
    for(var i = 0; i < 10; i++) {
      allModels.add(new TehModel({value: i}));
    }

    collection = new ModelCollection({collection: allModels, perPage: 2});
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

  it("should trigger a reset event when the underlying model changed", function() {
    var triggered = 0;
      collection.bind("reset", function() {
        triggered += 1;
      });
      allModels.reset([new TehModel({value: 1})]);
      expect(triggered).toEqual(1);
  });
});