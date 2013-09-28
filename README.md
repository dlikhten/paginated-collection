# Paginated Collection

[![Build Status](https://travis-ci.org/dlikhten/paginated-collection.png?branch=master)](https://travis-ci.org/dlikhten/paginated-collection)

This is a simple paginated collection implemented using
Backbone.Collection. The goal here is to create a collection which will
show a subset of the original collection depending on the page.
Supports `add` `remove` `reset` `sort` events of the original model to modify 
the paginated version. Also any event triggered on the original which the paginated
collection doesn't understand will just be propagated.

# Why not just extend backbone?

Collections are great, but what is better is a filter chain. Why settle for just a paginator when you can build an entire chain of filters and a pagination. And if you feel like swapping this one for something else, why not?

# Usage

    var YourCollection = Backbone.Collection.extend({model: YourModel});
    var allItems = new YourCollection(...);

    // note the null argument. Backbone Collection wants the model
    // to reset this collection to as the first argument. This
    // collection only mutates by being a proxy to the underlying
    // collection
    var paginatedItems = new Backbone.PaginatedCollection(null, {collection: allItems});

    paginatedItems.perPage = 5;
    paginatedItems.changePage(3); // indices 10 - 14
    paginatedItems.totalPages();  // for 20 items, 4
    paginatedItems.page;          // 3

    paginatedItems.on("add")                // an item was added to current page
    paginatedItems.on("remove")             // an item was removed from current page
    paginatedItems.on("reset")              // reset the collection
    paginatedItems.on("paginated")          // changed pages
    paginatedItems.on("add-other-page")     // an item was added to another page
    paginatedItems.on("remove-other-page")  // an item was removed from another page


Please note: adding/removing/resetting the original model will force the
collection to page to page #0. If you wish, you can preserve the page
then page back to whatever page you had. Though it is not guaranteed
that the page you had will still exist.

Note that the "paginated" even will be triggered when the page changes.

# Testing

`gem install jasmine --no-ri --no-rdoc` and then run `rake jasmine` go to `localhost:8888` and you are good to go.

Note: I included a `.rvmrc` incase you have rvm set up.
