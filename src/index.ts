import Sdk, { ManifestBuilder } from '@radixdlt/alphanet-walletextension-sdk';
import { TransactionApi } from '@radixdlt/alphanet-gateway-api-v0-sdk'
import * as QRCode from 'qrcode';
import $ from "jquery";


// Initialize the SDK
const sdk = Sdk()
const transactionApi = new TransactionApi()

// Global states
let accountAddress: string // User account address
let componentAddress: string  // Bank component address
let packageAddress = "package_tdx_a_1q824gavtfsm0ktdj9z8w5h20wjlx2pdxy89trmgmkfdsyx8jp8"; // Package address

// Copy function
document.getElementById('idaddress').onclick = async function() {
  var copyText = document.getElementById("address");

  // Select the text field
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

   // Copy the text inside the text field
  navigator.clipboard.writeText(copyText.value);

  $("#idaddress").text($("#idaddress").text() == 'Identification Address' ? 'Copied Address!' : 'Identification Address');
}

// Fetches Account Address and balance for an existing account
document.getElementById('authenticate').onclick = async function () {
  // Retrieve extension user account address
  const result = await sdk.request({
    accountAddresses: {},
  })
  console.log("Manju")
  console.log(result)

  if (result.isErr()) {
    throw result.error
  }

  const { accountAddresses } = result.value
  if (!accountAddresses) return

  accountAddress = accountAddresses[0].address

  // Converting the data into base64
  QRCode.toDataURL(accountAddress, function (err, code) {
    if(err) return console.log("error occurred")

    var x = document.createElement("IMG");
    x.setAttribute("src", code);
    document.getElementById('qr').appendChild(x);
  })

  if (document.getElementById("id").value) {
    $("#login").fadeOut("normal", function() {
      $("#loader").fadeIn("normal")
    });

    let compAddress = document.getElementById("id").value
    componentAddress = compAddress

    // Call the balance method
    let manifest = new ManifestBuilder()
      .callMethod(accountAddress, "lock_fee", ['Decimal("100")'])
      .callMethod(compAddress, "balances", [])
      .build()
      .toString();

    // Send manifest to extension for signing
    const hash = await sdk
      .sendTransaction(manifest)
      .map((response) => response.transactionHash)

    if (hash.isErr()) throw hash.error

    // Fetch the receipt from the Gateway SDK
    const balanceReceipt = await transactionApi.transactionReceiptPost({
      v0CommittedTransactionRequest: { intent_hash: hash.value },
    })

    if (balanceReceipt) {
      // Get Bank and Cash balance with a pinch of regex magic
      const bank_account_balance = balanceReceipt.committed.receipt.output[1].data_json.elements[0].value.match(/\((.*)\)/).pop().slice(1, -1)
      const cash_balance = balanceReceipt.committed.receipt.output[1].data_json.elements[1].value.match(/\((.*)\)/).pop().slice(1, -1)

      document.getElementById('showBankBalance').innerText = bank_account_balance;
      document.getElementById('showCashBalance').innerText = cash_balance;
      document.getElementById('address').value = componentAddress;

      $("#loader").delay(1000).fadeOut("slow", function() {
        $("#follow").fadeIn("normal");
      })
    }
  }
}


// Fetches Account Address and balance for a new account
document.getElementById('fetchAccountAddress').onclick = async function () {
  // Retrieve extension user account address
  const result = await sdk.request({
    accountAddresses: {},
  })

  if (result.isErr()) {
    throw result.error
  }

  const { accountAddresses } = result.value
  if (!accountAddresses) return

  accountAddress = accountAddresses[0].address

  // Converting the data into base64
  QRCode.toDataURL(accountAddress, function (err, code) {
    if(err) return console.log("error occurred")

    var x = document.createElement("IMG");
    x.setAttribute("src", code);
    document.getElementById('qr').appendChild(x);
  })
  
  // Instantiates the Bank Component
  let manifest = new ManifestBuilder()
    .callMethod(accountAddress, "lock_fee", ['Decimal("100")'])
    .callFunction(packageAddress, "Bank", "instantiate_bank", [])
    .build()
    .toString();

  // Send manifest to extension for signing
  const hash = await sdk
    .sendTransaction(manifest)
    .map((response) => response.transactionHash)

  if (hash.isErr()) throw hash.error

  // Fetch the receipt from the Gateway SDK
  const receipt = await transactionApi.transactionReceiptPost({
    v0CommittedTransactionRequest: { intent_hash: hash.value },
  })

  if(receipt) {
    $("#initial").fadeOut("normal", function(){
      $("#loader").fadeIn("normal");
    });

    componentAddress = receipt.committed.receipt.state_updates.new_global_entities[1].global_address
    let compAddress = componentAddress

    // Call the balance method
    let manifest = new ManifestBuilder()
      .callMethod(accountAddress, "lock_fee", ['Decimal("100")'])
      .callMethod(compAddress, "balances", [])
      .build()
      .toString();

    // Send manifest to extension for signing
    const hash = await sdk
      .sendTransaction(manifest)
      .map((response) => response.transactionHash)

    if (hash.isErr()) throw hash.error

    // Fetch the receipt from the Gateway SDK
    const balanceReceipt = await transactionApi.transactionReceiptPost({
      v0CommittedTransactionRequest: { intent_hash: hash.value },
    })

    if (balanceReceipt) {
      // Get Bank and Cash balance with a pinch of regex magic
      const bank_account_balance = balanceReceipt.committed.receipt.output[1].data_json.elements[0].value.match(/\((.*)\)/).pop().slice(1, -1)
      const cash_balance = balanceReceipt.committed.receipt.output[1].data_json.elements[1].value.match(/\((.*)\)/).pop().slice(1, -1)

      document.getElementById('showBankBalance').innerText = bank_account_balance;
      document.getElementById('showCashBalance').innerText = cash_balance;
      document.getElementById('address').value = componentAddress;

      $("#loader").delay(1000).fadeOut("slow", function() {
        $("#follow").fadeIn("normal");
      })
    }
  }
}

// Withdraw
document.getElementById('withdraw').onclick = async function () {
  let withdrawCompAddress = componentAddress;
  let amount = document.getElementById("amount").value;
  
  let manifest = new ManifestBuilder()
    .callMethod(accountAddress, "lock_fee", ['Decimal("100")'])
    .callMethod(withdrawCompAddress, "bank_withdraw", [`Decimal("${amount}")`])
    .build()
    .toString();

  // Send manifest to extension for signing
  const hash = await sdk
    .sendTransaction(manifest)
    .map((response) => response.transactionHash)

  if (hash.isErr()) throw hash.error

  // Fetch the receipt from the Gateway SDK
  const receipt = await transactionApi.transactionReceiptPost({
    v0CommittedTransactionRequest: { intent_hash: hash.value },
  })

  // Get Bank and Cash balance with a pinch of regex magic
  const withdraw_bank_account_balance = receipt.committed.receipt.output[1].data_json.elements[0].value.match(/\((.*)\)/).pop().slice(1, -1)
  const withdraw_cash_balance = receipt.committed.receipt.output[1].data_json.elements[1].value.match(/\((.*)\)/).pop().slice(1, -1)
  document.getElementById('showBankBalance').innerText = withdraw_bank_account_balance;
  document.getElementById('showCashBalance').innerText = withdraw_cash_balance;
}

// Deposit
document.getElementById('deposit').onclick = async function () {
  let depositCompAddress = componentAddress;
  let amount = document.getElementById("amount").value;
  
  let manifest = new ManifestBuilder()
    .callMethod(accountAddress, "lock_fee", ['Decimal("100")'])
    .callMethod(depositCompAddress, "bank_deposit", [`Decimal("${amount}")`])
    .build()
    .toString();

  // Send manifest to extension for signing
  const hash = await sdk
    .sendTransaction(manifest)
    .map((response) => response.transactionHash)

  if (hash.isErr()) throw hash.error

  // Fetch the receipt from the Gateway SDK
  const receipt = await transactionApi.transactionReceiptPost({
    v0CommittedTransactionRequest: { intent_hash: hash.value },
  })

  // Get Bank and Cash balance with a pinch of regex magic
  const deposit_bank_account_balance = receipt.committed.receipt.output[1].data_json.elements[0].value.match(/\((.*)\)/).pop().slice(1, -1)
  const deposit_cash_balance = receipt.committed.receipt.output[1].data_json.elements[1].value.match(/\((.*)\)/).pop().slice(1, -1)
  document.getElementById('showBankBalance').innerText = deposit_bank_account_balance;
  document.getElementById('showCashBalance').innerText = deposit_cash_balance;
}