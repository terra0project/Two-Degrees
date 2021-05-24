/*

                      (
  *   )               )\ )
` )  /( (  (         (()/(     (   (  (  (      (    (
 ( )(_)))\))(    (    /(_))   ))\  )\))( )(    ))\  ))\ (
(_(_())((_)()\   )\  (_))_   /((_)((_))\(()\  /((_)/((_))\
|_   _|_(()((_) ((_)  |   \ (_))   (()(_)((_)(_)) (_)) ((_)
  | |  \ V  V // _ \  | |) |/ -_) / _` || '_|/ -_)/ -_)(_-<
  |_|   \_/\_/ \___/  |___/ \___| \__, ||_|  \___|\___|/__/
                                  |___/

*/
// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.8;
import "./Metadata.sol";
import "./TemperatureOracle.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title TemperatureToken
 * @dev   Token contract for '2 Degrees' NTF.
 */
contract TemperatureToken is ERC721, Ownable {

    Metadata          public metadata;
    TemperatureOracle public temperatureOracle;

    event TokenBurned(uint256 tokenId);

    modifier onlyOracle() {
        require(msg.sender == address(temperatureOracle), "caller not temperature oracle");
        _;
    }

    constructor(
        Metadata _metadata,
        TemperatureOracle _temperatureOracle
        ) public ERC721("Two Degrees", "2DG") {
        metadata = _metadata;
        temperatureOracle = _temperatureOracle;
    }

    /**
     * @dev             Safely mints `tokenId` and transfers it to `to`.
     * @param to        Address to receive minted token.
     * @param tokenId   ID of minted token.
     * @param _data     Additional bytes array of data to include in token.
     */
    function mint(address to, uint256 tokenId, bytes memory _data) public onlyOwner {
        _safeMint(to, tokenId, _data);
    }

    /**
     * @dev              Destroys `tokenId`. Emits `TokenBurned` event.
     * @param _tokenId   ID of token to be burned.
     */
    function burn(uint256 _tokenId) public onlyOracle {
        _burn(_tokenId);
        emit TokenBurned(_tokenId);
    }

    /**
     * @dev                       Updates `TemperatureOracle` contract.
     * @param _temperatureOracle   Address of new `TemperatureOracle` contract.
     */
    function updateTempOracle(TemperatureOracle _temperatureOracle) public onlyOwner {
        temperatureOracle = _temperatureOracle;
    }

    /**
     * @dev                       Updates `Metadata` contract.
     * @param _metadata   Address of new `Metadata` contract.
     */
    function updateMetadata(Metadata _metadata) public onlyOwner {
        metadata = _metadata;
    }

    /**
     * @dev              Returns metadata of `tokenId`.
     * @param _tokenId   ID of token queried.
     */
    function tokenURI(uint256 _tokenId) public override view returns (string memory _infoUrl) {
        return Metadata(metadata).tokenURI(_tokenId);
    }
}
