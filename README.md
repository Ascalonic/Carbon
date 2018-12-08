# Carbon
Carbon is first of its kind Realtime Hardware Emulation Server (RHES)

## Background
The problem was to develop an architecture capable of emulating microcontrollers in a generic fashion - one code that is assumed to work in all hardware, as part of Project Carbon by Ascalonic. The assumption was any microcontroller can be thought as a Turing Machine and therefore any turing machine must be able to emulate their working. 

## Architecture
Carbon is written as a node server. However, both the frontend and backend plays a crucial role.

### The pipeline
The most important part of Carbon is a **Node VM Instance** to which a 'sandbox context' is passed. The code which the sandbox executes consist of maily two segments:
* The first Segment is the code written by the user, POSTed from the front-end
* The second segment is a boilerplate code which contains definitions for the functions, constants and classes which 'emulate' a microcontroller programming language - specifically embedded C (for instance, pinMode function)
The first segment itself can be categorized into two :
* The design code - which specifies the components involved and their connections
* The programming code - which dictates the working of the device

The output from the VM will be the **time series output** of the controlling device. This output is passed back to the frontend where it is rendered using a timer.

### But how can the user interaction be integrated?
The time series output from the server is not indefinite. But rather, only constant, fixed steps are emulated at once. The user interaction can be passed as IO inputs in the next batch. 

Although this method will work, it requires the state of VM be saved across batches. For this, the script before being fed to the VM, is pre-processed using an ECMAScript parser (esprima) to refactor the identifiers and save it globally.

## Development
Current implementation also features an interactive UI where the design could be rendered. Based on the design information recieved from the server, it build a dynamic SVG.
The following features are yet to be added:
* User-Interactive devices with bound event handlers that can trigger IO inputs (like... a Switch)
* Multi-User environment which stores the User Info in the backend in a fast memory
* Performance enhancements for the Refactoring section
etc
