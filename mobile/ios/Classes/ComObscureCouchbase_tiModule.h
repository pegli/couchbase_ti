/**
 * Your Copyright Here
 *
 * Appcelerator Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 */
#import "TiModule.h"
#import "Couchbase.h"

#define kEventServerStarted @"com.obscure.couchbase_ti.server_started"
#define kEventParamServerURL @"serverUrl"

@interface ComObscureCouchbase_tiModule : TiModule <CouchbaseDelegate> {
    NSString * _serverUrl;
}
@property (nonatomic, readonly) NSString * serverUrl;
- (void)startCouchbase:(id)args;
@end
