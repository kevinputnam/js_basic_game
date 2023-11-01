Adventure Game Editor
#######################

:Created by: Kevin Putnam
:Art Credit: D Machin - royalty free art purchased from https://malibudarby.itch.io

.. warning::

   If this is alpha quality software, it is just barely.

Conceived as a way to create simple games and learn JavaScript. I wanted to create new games reminiscent of my favorite game experiences. These were not characterized by extensive graphics or combat but by exploration, meaningful missions, making friends and other interesting encounters. While looking at various ways of making games, I really liked using GB-Studio, but I also chafed at the limitations. I wanted something equally simple without the limitations intrinsic to the GameBoy platform. If it was already out there, I didn't find it, so I made this. This version is more of a glorified proof of concept than a finished piece of software. My goal is to create a simple game, identify and fix problems with the editor, and propose new features for the next iteration.

Architecture
=============

Everything is built on the ``BuildingBlock`` class. Each Object type is responsible for providing a means for displaying itself in the treeview, and editing itself in the editor. Each Object must also provide a ``run()`` method. Game scripting is provided by the ``Action`` class.