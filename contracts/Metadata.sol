pragma solidity ^0.6.8;

/**
* Metadata contract is upgradeable and returns metadata about Token
*/
// SPDX-License-Identifier: GPL-3.0-or-later

import "./helpers/strings.sol";

contract Metadata {
    using strings for *;

    function tokenURI(uint _tokenId) public pure returns (string memory _infoUrl) {
        string memory base = "md.twodegrees.terra0.org";
        return base;
    }
    function uint2str(uint i) internal pure returns (string memory) {
        if (i == 0) return "0";
        uint j = i;
        uint length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
        while (i != 0) {
            uint _uint = 48 + i % 10;
            bstr[k--] = toBytes(_uint)[31];
            i /= 10;
        }
        return string(bstr);
    }
    function toBytes(uint256 x) public pure returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
    }
}
