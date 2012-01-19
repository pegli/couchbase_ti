/**
 * Your Copyright Here
 *
 * Appcelerator Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 */
#import "ComObscureCouchbaseTiModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"

@implementation ComObscureCouchbaseTiModule

@synthesize server;

#pragma mark Internal

// this is generated for your module, please do not change it
-(id)moduleGUID
{
	return @"ffaaae27-9ded-4cca-adbd-7a5d984c4085";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
	return @"com.obscure.CouchbaseTi";
}

#pragma mark Lifecycle

-(void)startup
{
	// this method is called when the module is first loaded
	// you *must* call the superclass
	[super startup];
}

- (void)startCouchbase:(id)args {
  NSString * resourcesPath = [[NSBundle mainBundle] pathForResource:@"CouchbaseResources" ofType:nil inDirectory:@"modules/com.obscure.couchbaseti"];
  CouchbaseMobile * s = [[CouchbaseMobile alloc] initWithBundlePath:resourcesPath];
  s.delegate = self;
  if ([s start]) {
  	NSLog(@"[INFO] %@ loaded",self);
  }
  else {
    NSLog(@"[ERROR] could not start Couchbase server!");
  }
}

- (void)couchbaseMobile:(CouchbaseMobile *)couchbase didStart:(NSURL *)serverURL {
    NSLog(@"Couchbase started on %@", serverURL);
    self.server = couchbase;
    if ([self _hasListeners:kEventServerStarted]) {
        NSDictionary * event = [NSDictionary dictionaryWithObjectsAndKeys:[serverURL absoluteString], kEventParamServerURL, nil];
        [self fireEvent:kEventServerStarted withObject:event];
    }
}

- (void)couchbaseMobile:(CouchbaseMobile *)couchbase failedToStart:(NSError *)error {
    NSLog(@"Error starting Couchbase server: %@", [error description]);
}

-(void)couchbaseDidStart:(NSURL *)aServerURL {
    // TODO store server URL? create client?
}

-(void)shutdown:(id)sender
{
	// this method is called when the module is being unloaded
	// typically this is during shutdown. make sure you don't do too
	// much processing here or the app will be quit forceably
	
	// you *must* call the superclass
	[super shutdown:sender];
}

#pragma mark Cleanup 

-(void)dealloc
{
	// release any resources that have been retained by the module
	[super dealloc];
}

#pragma mark Internal Memory Management

-(void)didReceiveMemoryWarning:(NSNotification*)notification
{
	// optionally release any resources that can be dynamically
	// reloaded once memory is available - such as caches
	[super didReceiveMemoryWarning:notification];
}

#pragma mark Listener Notifications

-(void)_listenerAdded:(NSString *)type count:(int)count
{
	if (count == 1 && [type isEqualToString:@"my_event"])
	{
		// the first (of potentially many) listener is being added 
		// for event named 'my_event'
	}
}

-(void)_listenerRemoved:(NSString *)type count:(int)count
{
	if (count == 0 && [type isEqualToString:@"my_event"])
	{
		// the last listener called for event named 'my_event' has
		// been removed, we can optionally clean up any resources
		// since no body is listening at this point for that event
	}
}

#pragma Public APIs

@end
