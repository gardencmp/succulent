'use strict';
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
exports.BrandInstagramInsights =
  exports.UsertagList =
  exports.ListOfUsertagGroups =
  exports.UsertagGroup =
  exports.HashtagList =
  exports.ListOfHashtagGroups =
  exports.HashtagGroup =
  exports.UserTagMap =
  exports.ListOfLocations =
  exports.Location =
  exports.ListOfPosts =
  exports.ListOfBrands =
  exports.MetaAPIConnection =
  exports.Brand =
  exports.ListOfImages =
  exports.Image =
  exports.Post =
    void 0;
const jazz_tools_1 = require('jazz-tools');
class Post extends jazz_tools_1.CoMap {
  constructor() {
    super(...arguments);
    this.inBrand = jazz_tools_1.co.ref(Brand);
    this.content = jazz_tools_1.co.string;
    this.images = jazz_tools_1.co.ref(ListOfImages);
    this.instagram = jazz_tools_1.co.json();
    this.location = jazz_tools_1.co.ref(Location, { optional: true });
    this.userTags = jazz_tools_1.co.ref(UserTagMap, { optional: true });
    this.instagramInsights = jazz_tools_1.co.json();
  }
}
exports.Post = Post;
class Image extends jazz_tools_1.CoMap {
  constructor() {
    super(...arguments);
    this.imageFile = jazz_tools_1.co.ref(jazz_tools_1.ImageDefinition);
    this.instagramContainerId = jazz_tools_1.co.string;
  }
}
exports.Image = Image;
class ListOfImages extends jazz_tools_1.CoList.Of(jazz_tools_1.co.ref(Image)) {}
exports.ListOfImages = ListOfImages;
class Brand extends jazz_tools_1.CoMap {
  constructor() {
    super(...arguments);
    this.name = jazz_tools_1.co.string;
    this.metaAPIConnection = jazz_tools_1.co.ref(MetaAPIConnection, {
      optional: true,
    });
    this.instagramInsights = jazz_tools_1.co.ref(BrandInstagramInsights, {
      optional: true,
    });
    this.instagramPage = jazz_tools_1.co.json();
    this.posts = jazz_tools_1.co.ref(ListOfPosts);
    this.hashtagGroups = jazz_tools_1.co.ref(ListOfHashtagGroups);
    this.usertagGroups = jazz_tools_1.co.ref(ListOfUsertagGroups);
  }
}
exports.Brand = Brand;
class MetaAPIConnection extends jazz_tools_1.CoMap {
  constructor() {
    super(...arguments);
    this.longLivedToken = jazz_tools_1.co.string;
    this.validUntil = jazz_tools_1.co.encoded(jazz_tools_1.Encoders.Date);
  }
  isValid() {
    return this.validUntil > new Date();
  }
}
exports.MetaAPIConnection = MetaAPIConnection;
class ListOfBrands extends jazz_tools_1.CoList.Of(jazz_tools_1.co.ref(Brand)) {}
exports.ListOfBrands = ListOfBrands;
class ListOfPosts extends jazz_tools_1.CoList.Of(jazz_tools_1.co.ref(Post)) {}
exports.ListOfPosts = ListOfPosts;
class Location extends jazz_tools_1.CoMap {
  constructor() {
    super(...arguments);
    this.fbId = jazz_tools_1.co.string;
    this.name = jazz_tools_1.co.string;
  }
}
exports.Location = Location;
class ListOfLocations extends jazz_tools_1.CoList.Of(
  jazz_tools_1.co.ref(Location)
) {}
exports.ListOfLocations = ListOfLocations;
/** map from username to position */
class UserTagMap extends jazz_tools_1.CoMap.Record(jazz_tools_1.co.json()) {}
exports.UserTagMap = UserTagMap;
class HashtagGroup extends jazz_tools_1.CoMap {
  constructor() {
    super(...arguments);
    this.name = jazz_tools_1.co.string;
    this.hashtags = jazz_tools_1.co.ref(HashtagList);
  }
}
exports.HashtagGroup = HashtagGroup;
class ListOfHashtagGroups extends jazz_tools_1.CoList.Of(
  jazz_tools_1.co.ref(HashtagGroup)
) {}
exports.ListOfHashtagGroups = ListOfHashtagGroups;
class HashtagList extends jazz_tools_1.CoList.Of(jazz_tools_1.co.string) {} // without #
exports.HashtagList = HashtagList;
class UsertagGroup extends jazz_tools_1.CoMap {
  constructor() {
    super(...arguments);
    this.name = jazz_tools_1.co.string;
    this.usertags = jazz_tools_1.co.ref(UsertagList);
  }
}
exports.UsertagGroup = UsertagGroup;
class ListOfUsertagGroups extends jazz_tools_1.CoList.Of(
  jazz_tools_1.co.ref(UsertagGroup)
) {}
exports.ListOfUsertagGroups = ListOfUsertagGroups;
class UsertagList extends jazz_tools_1.CoList.Of(jazz_tools_1.co.string) {} // without @
exports.UsertagList = UsertagList;
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class BrandInstagramInsights extends jazz_tools_1.CoMap {
  constructor() {
    super(...arguments);
    this[_a] = jazz_tools_1.co.json();
  }
}
exports.BrandInstagramInsights = BrandInstagramInsights;
_a = jazz_tools_1.co.items;
