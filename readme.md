```
                      (
  *   )               )\ )
` )  /( (  (         (()/(     (   (  (  (      (    (
 ( )(_)))\))(    (    /(_))   ))\  )\))( )(    ))\  ))\ (
(_(_())((_)()\   )\  (_))_   /((_)((_))\(()\  /((_)/((_))\
|_   _|_(()((_) ((_)  |   \ (_))   (()(_)((_)(_)) (_)) ((_)
  | |  \ V  V // _ \  | |) |/ -_) / _` || '_|/ -_)/ -_)(_-<
  |_|   \_/\_/ \___/  |___/ \___| \__, ||_|  \___|\___|/__/
                                  |___/
```                              

This repo contains all of the code making up 'Two Degrees', a single NFT created for
Sotheby's '[Natively Digital: A Curated NTF Sale](https://www.sothebys.com/en/buy/auction/2021/natively-digital-a-curated-nft-sale-2/)' exhibition and auction.

A full write-up of the conceptual approach behind the project, plus a technical overview, can be found [here]**needs link**

#### Smart Contracts

There are two main smart contracts: an ERC721 Token, and a custom Oracle contract.

- `TemperatureOracle.sol` stores the average annual temperature rise as decided by NASA in their [annual report](https://data.giss.nasa.gov/gistemp/graphs/graph_data/Global_Mean_Estimates_based_on_Land_and_Ocean_Data/graph.txt), which can be updated by the `o-address`, an automated event listener running on a server. When this value crosses the threshold of 2 degrees centigrade, the token is able to be burned by anyone who wants to call the token contract's `burn()` function and do so.

- `TemperatureToken` implements a standard ERC721 interface using most OpenZeppelin  functions. There is a small custom ACL which allows the `TemperatureOracle` contract to burn the minted token if the annual average temperature increase is > 2 degrees Celsius.
