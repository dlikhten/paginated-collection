# Paginated Collection

This is a simple paginated collection implemented using
Backbone.Collection. The goal here is to create a collection which will
show a subset of the original collection depending on the page.
Supports add/remove/reset events of the original model to modify the
paginated version.

# Why not just extend backbone?

The main reason I did not just extend backbone is because by extending
it, you shove all behaviors into one model, making it a
jack-of-all-trades and potentially conflicting with behaviors of other
extentions, not to mention making normal operaitons potentially slower.
So the intention is to compose a Chain of Responsibility pattern using
these guys.

# Usage

    var YourCollection = Backbone.Collection.extend({model: YourModel});
    var YourPaginatedCollection = Backbone.PaginatedCollection.extend({model: YourModel});
    var allItems = new YourCollection(...);
    var paginatedItems = new YourPaginatedCollection({origModel: allItems});
    var paginatedItems.perPage = 5;
    var paginatedItems.changePage(3); // indices 10 - 14
    var paginatedItems.totalPages();  // for 20 items, 4
    var paginatedItems.page;          // 3

Please note: adding/removing/resetting the original model will force the
collection to page to page #0. If you wish, you can preserve the page
then page back to whatever page you had. Though it is not guaranteed
that the page you had will still exist.

Note that the "paginated" even will be triggered when the page changes.
