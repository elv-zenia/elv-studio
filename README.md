# Eluvio Studio

A web application for ingesting content onto the Eluvio fabric. This app runs with the Content Fabric Eluvio Core JS framework.

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

### Installation and Initiation

Run the following to install module dependencies and run the server.
```
npm install
npm run serve
```
The app is running at [http://localhost:8082/#/apps/Eluvio%20Studio](http://localhost:8082/#/apps/Eluvio%20Studio)

### Ingest Process Internals

#### Overview

Creating a playable media object involves the following steps:
* **Create a Production Master object** - the master object holds copies of the original source file(s) and/or links to source files stored in S3. It is not directly playable, but is used to generate a playable Mezzanine object.
* **Upload file(s) to Master (or add links to S3 files)** - for files that are on S3, you can either copy the files into the fabric or just use a reference link to S3.
* **Create an ABR Profile** - the ABR (Adjustable BitRate) profile holds settings for generating the final playable object such as resolution, bitrate, and DRM options.
* **Create a Mezzanine object** - the mezzanine object holds the playable media that has been transcoded and optimized for low latency playback.
* **Start transcode job(s)** - each job transcodes one stream in the final mezzanine.
* **Monitor job status and finalize mezzanine when finished** - After all transcodes have finished, finalizing the mezzanine populates metadata needed for playback, then publishes the object to make it accessible.

#### Details

Each step above consists of a number of smaller steps that call various functions in [elv-client-js](https://github.com/eluv-io/elv-client-js) and [elv-abr-profile](https://github.com/eluv-io/elv-abr-profile):

* **Create a Production Master**
  * Create object (`ElvClient.CreateProductionMaster()`)
  * Upload file(s) (`ElvClient.UploadFiles()` or `ElvClient.UploadFilesFromS3()`)
  * Encrypt object (`ElvClient.CreateEncryptionConk()`)
* **Create an ABR Profile**
  * Get variant and sources metadata. This may come from the Production Master metadata, illustrated below:
  ```
  ElvClient.ContentObjectMetadata({
  select: [
    "production_master/sources",
    "production_master/variants/default"
    ]
  })
  ```
  * Generate an ABR Profile based on the above sources and default variant as well as optional ABR profile and standard aspect ratios (`ABR.ABRPorfileForVariant(sources, variant, abr, standardAspectRatios)`)
* **Create a Mezzanine object**
  * Edit or Create object (`ElvClient.EditContentObject()` or `ElvClient.CreateContentObject()`)
  * Encrypt object (`ElvClient.CreateEncryptionConk()`)
* **Start transcode job(s)**
  * Start jobs (`ElvClient.StartABRMezzanineJobs()`)
* **Monitor job status and finalize mezzanine when finished**
  * Poll job status until complete (`ElvClient.LROStatus()`)
  * Finalize (`ElvClient.FinalizeABRMezzanine()`)
