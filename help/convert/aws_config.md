  aws_config pulls Ruby AWS SDK data to translate AWS Config Rule results into HDF format json to be viewable in Heimdall

AWS Config Rule Mapping:
  The mapping of AWS Config Rules to 800-53 Controls was sourced from [this link](https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html).

Authentication with AWS:
  [Developer Guide for configuring Ruby AWS SDK for authentication](https://docs.aws.amazon.com/sdk-for-ruby/v3/developer-guide/setup-config.html)

  Authentication Example:

  - Create `~/.aws/credentials`
  - Add contents to file, replacing with your access ID and key

        ```
        [default]
        aws_access_key_id = your_access_key_id
        aws_secret_access_key = your_secret_access_key
        ```

  - (optional) set AWS region through `~/.aws/config` file with contents

        ```
        [default]
        output = json
        region = us-gov-west-1
        ```
Examples:
  saf convert:aws_config2hdf -o aws_config_results.json
