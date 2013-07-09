all: flickr-share-template.zip

flickr-share-template.zip:
	git archive --format zip --output flickr-share-template.zip master

clean:
	rm flickr-share-template.zip
