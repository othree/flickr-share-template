Flickr Share with Template
==========================

Provide template based Flickr share photo function.

Introduction
------------

Flickr's share with HTML/BBCode function is not update for a long time. Several issues bothers me:

* Template didn't support XHTML markup
* Only several size available
* Only **http** protocol is provided, but Flickr do support **https**
* HTML and BBCode is not enough now
* And there is no custom template feature

So I build this chrome extension. Use easy to learn [mustache][] template language.

[mustache]:http://mustache.github.io/

Available Variables
-------------------

The following variables are available in your template.

Basic information:

* title
* desc
* owner.username
* url

Photo in different sizes:

* Square
* Square75
* LargeSquare
* Square150
* Thumbnail
* Small
* Small240
* Small320
* Medium
* Medium500
* Medium640
* Medium800
* Large
* Large1024
* Large1600
* Large2048
* Original

All above sizes have 5 attributes can use:

* url
* source
* sourceNoProtocol
* width
* heigh

**sourceNoProtocol** is a url link without protocol prefix(relative protocol):

    //farm8.staticflickr.com/7316/9207170905_47cdf4e1f5_b.jpg

This url format can be use under both **http** and **https** protocol.

An example to use **Large2048** image:

    <img src="{{Large2048.source}}" width="{{Large2048.width}}" height="{{Large2048.height}}" />

All labels above except **Original** can add a prefix 'to', which implies the largest image can get until reach the label's size. For example, if an image's original width is 1000px. Then use 'toLarge2048' will give you 'Medium800'. This feature is designed for default image.

Not all size are available if your image is small. So you can detect is it exists:

    {{#Large2048}}
    <img src="{{Large2048.source}}" width="{{Large2048.width}}" height="{{Large2048.height}}" />
    {{/Large2048}}

You can write other document not just html. For example, markdown:

    ![{{title}} by {{owner.username}}, on Flickr]({{Large1024.source}})

Default template is using [srcset][], the listing below is with beautiful indent for you to see what's inside easily:

    <a class="thumbnail" href="{{url}}" title="{{title}} by {{owner.username}}, on Flickr">
      <img src="{{toLarge.sourceNoProtocol}}" width="{{toLarge.width}}" height="{{toLarge.height}}" 
        alt="{{title}}" 
        srcset="{{toMedium.sourceNoProtocol}} 768w
          {{#Large2048}}, {{Large2048.sourceNoProtocol}} 2x{{/Large2048}}" />
    </a>


[srcset]:https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset

KNOWN ISSUE
-----------

Mustache is very logic-less, so its hard to have if-else in your template.

