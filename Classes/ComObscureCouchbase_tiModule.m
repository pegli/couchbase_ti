/**
 * Your Copyright Here
 *
 * Appcelerator Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 */
#import "ComObscureCouchbase_tiModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"

@implementation ComObscureCouchbase_tiModule

@synthesize serverUrl=_serverUrl;

#pragma mark Internal

// this is generated for your module, please do not change it
-(id)moduleGUID
{
	return @"08aaae27-9ded-4cca-adbd-7a5d984c4085";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
	return @"com.obscure.couchbase_ti";
}

#pragma mark Lifecycle

-(void)startup
{
	// this method is called when the module is first loaded
	// you *must* call the superclass
	[super startup];
	
	NSLog(@"[INFO] %@ loaded",self);
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
    NSLog(@"added listener for type %@", type);
	if (count == 1 && [type isEqualToString:kEventServerStarted])
	{
		// the first (of potentially many) listener is being added 
		// for event named 'my_event'
	}
}

-(void)_listenerRemoved:(NSString *)type count:(int)count
{
	if (count == 0 && [type isEqualToString:kEventServerStarted])
	{
		// the last listener called for event named 'my_event' has
		// been removed, we can optionally clean up any resources
		// since no body is listening at this point for that event
	}
}

#pragma mark - Public Methods

- (void)startCouchbase:(id)args {
    NSLog(@"go go couchbase!");
    [Couchbase startCouchbase:self];
}

#pragma mark - CouchbaseDelegate

- (void)couchbaseDidStart:(NSURL *)serverURL {
    [_serverUrl release];
    _serverUrl = [serverURL absoluteString];
    NSLog(@"couchbase started on %@", self.serverUrl);
    
//    if ([self _hasListeners:kEventServerStarted]) {
        NSDictionary * event = [NSDictionary dictionaryWithObjectsAndKeys:self.serverUrl, kEventParamServerURL, nil];
        [self fireEvent:kEventServerStarted withObject:event];
        NSLog(@"fired event");
//    }
    
}

- (NSString *)couchbaseAppRoot {
    NSString * bundlePath = [[NSBundle mainBundle] bundlePath];
    return [NSString stringWithFormat:@"%@/modules/%@/Couchbase.bundle", bundlePath, [self moduleId]];
}

@end
