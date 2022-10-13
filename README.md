# Eluvio Studio

A web application for ingesting content onto the Eluvio fabric. This app runs with the Content Fabric elv-core-js framework.

### Prerequisites

- Node.js version 16 or 18
- NPM 8 or higher
- ElvCore cloned, installed, and running. See the [documentation](https://github.com/eluv-io/elv-core-js) on getting started before proceeding.
- 
NOTE: The pre-configured port of elv-studio is 8110. Make sure that elv-core-js configuration is pointing to the elv-studio server with the correct port.

Example elv-core-js configuration.js file.
```
const EluvioConfiguration = {
  "apps": {
    "Eluvio Studio": "http://localhost:8110"
  }
};
```

### Quick Start

Run the following to install module dependencies and run the server.
```
npm install
npm run serve
```
The app is running at [http://localhost:8082/#/apps/Eluvio%20Studio](http://localhost:8082/#/apps/Eluvio%20Studio)

### The Process

Creating a media playable object involves several elv-client-js API calls, which take care of uploading files, creating an ABR ladder, and finalizing objects, to name a few. Read on to understand the mechanisms involved.

#### Create a Production Master

The Production Master is a content object that contains the original source files. While it is not playable itself, it is used to create a playable Mezzanine Object.


The following call will create the Production Master:
```
CreateProductionMaster()
```

To further understand this abstract, the following outlines the core functionality:

- First the object must be instantiated, preferably with a Content Type.
- The files are uploaded, either locally or via an Amazon S3 link. Below are the respective API calls.
    Local file
    ```
    UploadFiles()
    ```
    
    S3 link
    ```
    UploadFilesFromS3()
    ```
- The object is also encrypted, using the following call:
    ```
    CreateEncryptionConk()
    ```
- Once the files are uploaded and the object is encrypted, the files need to be probed for streams. The below call asks the server to look through the files for video and audio streams and create a variant, which are all added to the metadata.
    ```
    CallBitcodeMethod({
      method: "media/production_master/init",
      body: {
        access: [] // This will contain cloud credentials if uploading from an s3 link
      }
    })
    ```

- The object has been created, had files uploaded and probed, but it is still a draft. The final call to finalize saves the Production Master.
    ```
    FinalizeContentObject()
    ```

#### Create ABR Ladder

An ABR ladder is an Adjustable Bitrate profile to use when ingesting media. The following can be called from `elv-abr-profile`, which will generate an ABR profile:

```
const ABR = require('elv-abr-profile');

ABR.ABRProfileForVariant(
  prodMasterSources,
  prodMasterVariants,
  abrProfile
)
```

#### Create ABR Mezzanine

A Mezzanine Object contains transcoded media. This object can use the Master Object or create a new object.

```
CreateABRMezzanine({
  objectId, // Provided if using the Master Object,
  type // Mezzanine Content Type
})
```

#### Start ABR Mezzanine Jobs

Once the Mezzanine Object has been created, the jobs are initiated and transcoding begins on the server.

```
StartABRMezzanineJobs()
```

#### Check LRO Status

The transcoding may be a lengthy process. The call below returns detailed progress info for Mezzanine jobs.

```
LROStatus()
```

#### Finalize

Similar to finalizing the Production Master, the Mezzanine Object must also be finalized.

```
FinalizeABRMezzanine()
```
