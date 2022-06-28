# add_ipv6

#### Table of Contents

1. [Description](#description)
1. [Setup - The basics of getting started with add_ipv6](#setup)
    * [What add_ipv6 affects](#what-add_ipv6-affects)
    * [Setup requirements](#setup-requirements)
    * [Beginning with add_ipv6](#beginning-with-add_ipv6)
1. [Usage - Configuration options and additional functionality](#usage)
1. [Reference - An under-the-hood peek at what the module is doing and how](#reference)
1. [Limitations - OS compatibility, etc.](#limitations)
1. [Development - Guide for contributing to the module](#development)
1. [Contributors](#contributors)

## Description

This module is used to discover IPv6 addresses (from DNS) and configure these 
addresses to any active interface on the system.

This module allows for the application of customized, standard settings to each
interface on the system as well. The module provides a defined type that can
be used to directly configure an interface but it can also be used in automatic
mode system interface that is determined to have a valid DNS entry based on a
custom fact.

## Setup

### What add_ipv6 affects

This module will modify any system interface file that has a valid IP address
which maps to a hostname in DNS.

### Setup Requirements

Pluginsync must be enabled so that the custom fact is distributed to managed
hosts. The module will not perform properly if the custom fact fails to run.

### Beginning with add_ipv6

At a minimum, to be used in automatic mode, the module must be declared and
provided with an IPv6 default gateway (`$default_gateway`).

```puppet
class { 'add_ipv6':
  default_gateway => '<ipv6_gw_address>',
}
```

Otherwise, the automatic mode can be disabled, via Hiera, or directly and can
then use the defined type (`add_ipv6::interface_ipv6`) to configure specific
interfaces. Usage of the defined type is described later.

## Usage

### Automatically configure all local interfaces

```puppet
class { 'add_ipv6':
  default_gateway => '<ipv6_gw_address>',
}
```

### Configure specific interface with the defined type

First set default values for the class while disabling automatic mode

Set the defaults via Hiera
```hiera
add_ipv6::automatic: False
add_ipv6::default_gateway: '<ipv6_gw_address>'
```

Or declare the class
```puppet
class { 'add_ipv6':
  default_gateway => '<ipv6_gw_address>',
  automatic       => false,
}
```

Then use the defined type to configure an interface
```puppet
add_ipv6::interface_ipv6 { '<ifname>':
  ipv6_settings => {'IPV6_DEFROUTE' => 'no'}
  ipv6_addr     => '<ipv6_address>',
  restart_if    => true,
}
```

## Reference

* [Public classes](#public-classes)
* [Defined types](#defined-types)
* [Facts](#facts)

### Public classes

The main class (`add_ipv6`) is the only public class.

**Parameters**

All parameters are optional unless otherwise noted.

#### `default_gateway`
**Required.**

Provides the IPv6 address of the default gateway which is applied to the
primary system interface as determined based on the hostname of the system.

Values: A valid IPv6 address (not validated)

Default: undef (required)


#### `ipv6_settings`

Takes a hash of any specific settings that you would like applied to all
interfaces in automatic mode. If this parameter is used it is expected
to be a comlete list of parameters, including the default gateway, that
is to be applied to ALL interfaces.

Values: Takes only a hash that maps IPv6 settings to their intended values.
  The values are not validated to be valid settings.

Default: Empty hash (`{}`)

#### `automatic`

Enables/disables the automatic mode for the module. The automatic mode 
detects all system interfaces with valid IPv4 addresses and corresponding
DNS entries and configures those interfaces with IPv6 addresses and IPv6
settings.

Values: `true`, `false`

Default: `true`

#### `set_comments`

Configures whether comments will be placed in the interface configuration files
informing administrators that certain values are being managed by Puppet and 
will, therefore, be overwritten periodically.

Values: `true`, `false`

Default: `true`

#### `restart_if`

Controls whether the interfaces will be bounced after being configured.

Values: `true`, `false`

Default: `false`

### Defined types

#### `interface_ipv6`

Takes in information about an interface and uses it to modify a network
configuration file.

Example:
```puppet
add_ipv6::interface_ipv6 { '<ifname>':
  ipv6_settings => $default_ipv6_settings,
  ipv6_addr     => '<IPv6_address>',
  restart_if    => true,
}
```
Where `$default_ipv6_settings` is a hash containing a valid collection of
IPv6 (or other) settings.

**Parameters**

All parameters are optional, unless otherwise noted.

#### `title`

The title of the defined type MUST be the interface name of a valid system
network interface.

#### `ipv6_settings`
**Required.**

The definitive list of settings to apply to the interface configuration file.
This parameter is required as no interface takes just an IPv6 address. There
are always other required parameters to configure a working interface.

Values: A hash containg interface configuration settings.

#### `ipv6_addr`
**Required.**

The IPv6 address of the network interface. An IP address is always required.

Values: A valid IPv6 address (not validate)

#### `set_comment`

Configures whether comments will be placed in the interface configuration file
informing administrators that certain values are being managed by Puppet and 
will, therefore, be overwritten periodically.

Values: `true`, `false`

Default: `true`

#### `restart_if`

Controls whether the interface will be bounced after being configured.

Values: `true`, `false`

Default: `false`

### Facts

#### `primary_interface`

Returns the name of the primary interface based on which interface configuration
file contains the IPv4 address associated with the system hostname.

#### `ipv6_addrs`

Returns a mapping of network interface names to IPv6 addresses as retrieved from
DNS (dig).

## Limitations

This module does not validate IPv6 settings that are passed to it. It will
happily place any settings into the interface configuration files. If there
are typos in the provided values they will prevent the interface from starting.
Care must be taken to provide a valid list of settings to ensure a working
interface.

## Development

As of October 23, 2018 this module is not posted publicly for development. It
is only used internally for our customer. 

## Contributors

Lesley J. Kimmel - lesley.j.kimmel@gmail.com

