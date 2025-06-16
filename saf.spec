%define _rpmfilename %%{ARCH}/%%{NAME}-v%%{VERSION}-%%{ARCH}.rpm

%define name saf
%define release 1

Name: %{name}
Version: %{version}
Release: %{release}
Summary: The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines.

License: Apache-2.0
URL: https://saf.mitre.org
Source: %{name}-v%{version}-linux-x64.tar.gz

BuildRoot: %{buildroot}
BuildArch: noarch
ExclusiveArch: %{nodejs_arches} noarch

Requires: nodejs > 22.0.0

AutoReqProv: no

%description
%{summary}

%prep
%setup -q -c -n %{name}
rm ./saf/bin/node # need to delete bundled node so that we use the system node instead

%install
rm -rf %{buildroot}
mkdir -p %{buildroot}/opt/saf
cp -r ./saf %{buildroot}/opt
mkdir -p %{buildroot}%{_bindir}
ln -s /opt/saf/bin/saf %{buildroot}%{_bindir}/saf

%clean
rm -rf %{buildroot}

%files
%defattr(644, -, -, 755)
/opt/saf
%attr(755, -, -) /opt/saf/bin/saf
/usr/bin/saf