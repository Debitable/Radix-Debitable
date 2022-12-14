set -e

export xrd=resource_sim1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqu57yag

echo "Resetting environment"
resim reset
export account=$(resim new-account | sed -nr "s/Account component address: ([[:alnum:]_]+)/\1/p")
echo "Account = " $account
echo "XRD = " $xrd

echo "Publishing dapp"
export lendingapp_package=$(resim publish . | sed -nr "s/Success! New Package: ([[:alnum:]_]+)/\1/p")
echo "Package = " $lendingapp_package

output=`resim call-function $lendingapp_package LendingApp instantiate_pool "1000,$xrd" 1000 10 7 | awk '/Component: |Resource: / {print $NF}'`
export component=`echo $output | cut -d " " -f1`
export ADMIN_BADGE=`echo $output | cut -d " " -f2`
export lend_nft=`echo $output | cut -d " " -f3`
export borrow_nft=`echo $output | cut -d " " -f4`
export lnd=`echo $output | cut -d " " -f5`

echo 'COMPONENT = '$component
echo 'ADMIN_BADGE = '$ADMIN_BADGE
echo 'LEND_NFT = '$lend_nft
echo 'BORROW_NFT = '$borrow_nft
echo 'LND = ' $lnd


echo 'register'

resim call-method $component register 

resim call-method $component register_borrower

echo 'execute first run '

resim call-method $component borrow_money 100 "1,$borrow_nft"

resim call-method $component lend_money "100,$xrd" "1,$lend_nft"

resim call-method $component take_money_back "107,$lnd" "1,$lend_nft"

resim call-method $component lend_money "100,$xrd" "1,$lend_nft"

resim call-method $component take_money_back "107,$lnd" "1,$lend_nft"

resim call-method $component repay_money "110,$xrd" "1,$borrow_nft"

resim show $account

resim show $component

# echo 'execute second run '

# resim call-method $component lend_money "100,$xrd" "1,$lend_nft"

# resim call-method $component take_money_back "53,$lnd" "1,$lend_nft"

# resim call-method $component lend_money "100,$xrd" "1,$lend_nft"

# resim call-method $component take_money_back "161,$lnd" "1,$lend_nft"

# resim show $account

# resim show $component