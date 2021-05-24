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
/* solhint-disable expression-indent */
pragma solidity ^0.6.8;
import "./TemperatureToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title TemperatureOracle
 * @dev   Oracle smart contract for storing average annual temperature increase
 *        in degrees celcius. Acts as ACL for burning terra0 '2 Degrees' NFT.
 */
contract TemperatureOracle is Ownable {

    using SafeMath for uint256;

    TemperatureToken public temperatureToken;
    address          public gnosisSafe;
    bool             public canBurnIPFS;
    bool             public canBurnGnosisSafe;
    bool             public initialized;
    uint256          public temperatureDenuminator = 100;
    uint256          public temperatureNumerator = 100;
    address          public oAddress; // event listener on server
    string           public ipfsDocker;
    uint256          public callid;

    event LogTemp(uint temperatureDenuminator, uint temperatureNumerator);
    event CallTemp(string _ipfsDocker, uint callid);

    modifier initializer() {
        require(!initialized, "contract already initialized");
        initialized = true;
        _;
    }

    modifier protected() {
        require(initialized, "contract not initialized");
        _;
    }

    modifier canBurn() {
        require(canBurnIPFS       == true, "tokens cannot be burned - temperature must be verified by ipfs script");
        require(canBurnGnosisSafe == true, "tokens cannot be burned - temperature must be verified by safe");
        _;
    }

    /**
     * @dev                       Initialize Oracle.
     * @param _temperatureToken   NFT contract.
     * @param _oAddress           Address of 'oracle' account for updating contract.
     * @param _ipfsDocker         IPFS hash of temperature check Docker container.
     * @param _gnosisSafe         terra0 Gnosis Safe contract address.
     */
    function initialize(
        TemperatureToken _temperatureToken,
        address          _oAddress,
        string memory    _ipfsDocker,
        address          _gnosisSafe
        ) external initializer onlyOwner {
        temperatureToken = _temperatureToken;
        oAddress         = _oAddress;
        ipfsDocker       = _ipfsDocker;
        gnosisSafe       = _gnosisSafe;
        getTemperature();
    }

    /**
     * @dev             Set canBurnGnosisSafe variable. This is intended as a final
     *                  human validation of the oracle's result before token can be
     *                  set as burnable.
     * @param _newBool  New value of canBurnGnosisSafe.
     */
    function setBurnableSafe(bool _newBool) external protected {
        require(msg.sender == address(gnosisSafe), "sender not gnosis safe");
        canBurnGnosisSafe = _newBool;
    }

    /**
     * @dev             Update ipfsDocker variable.
     * @param _newIPFS  New location of Docker container on IFPS.
     */
    function setIPFSDocker(string memory _newIPFS) external protected onlyOwner {
        ipfsDocker = _newIPFS;
    }

    /**
     * @dev                 Update Oracle address.
     * @param _newOAddress  New address of oracle.
     */
    function setOAddress(address _newOAddress) external protected onlyOwner {
        oAddress = _newOAddress;
    }

    /**
     * @dev  Emit event triggering oAddress to check global temperature increase.
     */
    function getTemperature() public protected {
        callid = callid.add(1);
        emit CallTemp(ipfsDocker, callid);
    }

    /**
     * @dev                          Update temperature variables and check whether
     *                               Token should be burnable.
     * @param _temperatureNumerator  New temperature.
     */
    function _callback(
        uint256 _temperatureNumerator
    ) public protected {
        require(msg.sender == oAddress, "caller not oAddress");
        temperatureNumerator = _temperatureNumerator;
        if (temperatureNumerator >= 200) {
            _setBurnableIPFS(true);
        }
        emit LogTemp(temperatureNumerator, temperatureDenuminator);
    }

    /**
     * @dev             Burn token.
     * @param _tokenId  ID of the token to be burned.
     */
    function burn(uint256 _tokenId) public protected canBurn {
        temperatureToken.burn(_tokenId);
    }

    /**
     * @dev  Check if token is burnable according to oracle.
     */
    function isBurnableIPFS() public view returns(bool) {
        return canBurnIPFS;
    }

    /**
     * @dev  Check if token is burnable according to the terra0 Gnosis Safe.
     */
    function isBurnableSafe() public view returns(bool) {
        return canBurnGnosisSafe;
    }

    /**
     * @dev              Check if token is burnable according to oracle.
     * @param _newBool   Whether the token is burnable or not according to the
     *                   oracle. 
     */
    function _setBurnableIPFS(bool _newBool) internal {
        canBurnIPFS = _newBool;
    }

}
