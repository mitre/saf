%define debug_package %{nil}
%define name saf
%define version 1.4.7
%define release 1
%define buildroot %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)

Name: %{name}
Version: %{version}
Release: %{release}
Summary: saf

Group: Installation Script
License: Apache-2.0
Source: %{name}.tar.gz
BuildRoot: %{buildroot}
Requires: nodejs
BuildRequires: nodejs
AutoReqProv: no

%description
The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines.

%prep
%setup -q -c -n %{name}

%build
npm rebuild

%pre
getent group saf >/dev/null || groupadd -r saf
getent passwd saf >/dev/null || useradd -r -g saf -G saf -d /usr/lib/saf -m -s /sbin/nologin -c "saf" saf

%install
mkdir -p %{buildroot}/usr/lib/saf
cp -r ./ %{buildroot}/usr/lib/saf
mkdir -p %{buildroot}/var/log/saf

%post
systemctl enable /usr/lib/saf/saf.service

%clean
rm -rf %{buildroot}

%files
%defattr(644, saf, saf, 755)
/usr/lib/saf
/var/log/saf
%attr(755, saf, saf) /usr/lib/saf/bin/run
