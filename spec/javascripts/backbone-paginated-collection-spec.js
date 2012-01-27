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

    collection = new ModelCollection({origModel: allModels, perPage: 2});
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
  });
});